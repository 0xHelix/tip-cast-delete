import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";
import dotenv from 'dotenv';

dotenv.config({ path: './../../../../.env.local' });

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

export async function POST(request: NextRequest) {
  const { signerUuid, text, action, fid, pattern, deleteBefore } = (await request.json()) as {
    signerUuid?: string;
    text?: string;
    action?: string;
    fid?: number;
    pattern?: string;
    deleteBefore?: string;
  };

  if (action === "search") {
    if (!fid || !pattern || !deleteBefore) {
      return NextResponse.json(
        { message: "Missing fid, pattern, or deleteBefore in request body" },
        { status: 400 }
      );
    }

    try {
      const deleteBeforeDate = new Date(deleteBefore);
      const result = await searchCasts(fid, new RegExp(pattern), deleteBeforeDate);
      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      return NextResponse.json(
        { message: "Error searching casts" },
        { status: 500 }
      );
    }
  } else if (signerUuid && text) {
    try {
      const { hash } = await client.publishCast(signerUuid, text);
      return NextResponse.json(
        { message: `Cast with hash ${hash} published successfully` },
        { status: 200 }
      );
    } catch (err) {
      if (isApiErrorResponse(err)) {
        return NextResponse.json(
          { ...err.response.data },
          { status: err.response.status }
        );
      } else
        return NextResponse.json(
          { message: "Something went wrong" },
          { status: 500 }
        );
    }
  } else {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  const { signerUuid, castHashes } = (await request.json()) as {
    signerUuid: string;
    castHashes: string[];
  };

  if (!signerUuid || !castHashes || !Array.isArray(castHashes)) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    for (const hash of castHashes) {
      await client.deleteCast(signerUuid, hash);
    }
    return NextResponse.json(
      { message: `Casts deleted successfully` },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting casts:", err); // Improved logging
    if (isApiErrorResponse(err)) {
      return NextResponse.json(
        { ...err.response.data },
        { status: err.response.status }
      );
    } else {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
    }
  }
}

const parser = (cast: any) => {
  return {
    fid: parseInt(cast.author.fid),
    parentFid: cast.parentAuthor?.fid ? parseInt(cast.parentAuthor.fid) : undefined,
    hash: cast.hash || undefined,
    threadHash: cast.threadHash || undefined,
    parentHash: cast.parentHash || undefined,
    parentUrl: cast.parentUrl || undefined,
    text: cast.text || undefined,
    timestamp: new Date(cast.timestamp),
  };
};

const searchCasts = async (fid: number, pattern: RegExp, deleteBefore: Date): Promise<{ totalMatches: number, deletableMatches: number, matches: { hash: string, timestamp: Date }[] }> => {
  let totalMatches = 0;
  let deletableMatches = 0;
  let matches: { hash: string, timestamp: Date }[] = [];

  const fetchAndSearch = async (cursor?: string): Promise<void> => {
    const data = await client.fetchAllCastsCreatedByUser(fid, {
      limit: 150,
      cursor,
    });

    data.result.casts.forEach((cast: any) => {
      const parsed = parser(cast);
      if (pattern.test(parsed.text)) {
        totalMatches++;
        if (new Date(parsed.timestamp) < deleteBefore) {
          deletableMatches++;
        }
        matches.push({ hash: parsed.hash!, timestamp: parsed.timestamp });
      }
    });

    if (data.result.next.cursor !== null) {
      await fetchAndSearch(data.result.next.cursor);
    }
  };

  await fetchAndSearch();
  return { totalMatches, deletableMatches, matches };
};

