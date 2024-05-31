"use client";

import { NeynarAuthButton, useNeynarContext } from "@neynar/react";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import Image from "next/image";

// Error response interface
interface ErrorRes {
  message: string;
}

interface CastMatch {
  hash: string;
  timestamp: Date;
}

export default function Home() {
  const { user } = useNeynarContext();
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<CastMatch[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteResult, setDeleteResult] = useState<number | null>(null);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [deletableMatches, setDeletableMatches] = useState<number>(0);
  const [noMatchesFound, setNoMatchesFound] = useState<boolean>(false);


  const deleteBefore = "2024-05-29T23:59:59Z";
  const [deleteBeforeDate] = useState(new Date(deleteBefore));

  const handlePublishCast = async () => {
    try {
      await axios.post<{ message: string }>("/api/cast", {
        signerUuid: user?.signer_uuid,
        text,
      });
      alert("Cast Published!");
      setText("");
    } catch (err) {
      const { message } = (err as AxiosError).response?.data as ErrorRes;
      alert(message);
    }
  };

  const handleDeleteCast = async () => {
    if (!user) return;

    const castHashes = matches
      .filter(
        (cast) => new Date(cast.timestamp) < new Date(deleteBefore)
      )
      .map((cast) => cast.hash);

    // console.log("Casts to delete:", castHashes);

    if (castHashes.length === 0) {
      alert("No casts found to delete.");
      return;
    }

    setDeleteLoading(true);
    setDeleteResult(null);

    try {
      const response = await axios.delete("/api/cast", {
        data: { signerUuid: user?.signer_uuid, castHashes },
      });
      console.log("Delete response:", response.data);
      setDeleteResult(castHashes.length);
      setMatches(matches.filter((cast) => !castHashes.includes(cast.hash)));
    } catch (err) {
      console.error("Error deleting casts:", err);
      alert("Error deleting casts");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchCasts = async () => {
    if (!user) return;

    const fid = user.fid;
    const pattern = "\\d+\\s\\$[dD][eE][gG][eE][nN]";

    setSearchLoading(true);
    setMatches([]);
    setNoMatchesFound(false);

    try {
      const response = await axios.post("/api/cast", {
        action: "search",
        fid,
        pattern,
        deleteBefore,
      });
      setMatches(response.data.matches);
      setTotalMatches(response.data.totalMatches);
      setDeletableMatches(response.data.deletableMatches);
      if (matches.length === 0) {
        setNoMatchesFound(true)
      }
    } catch (err) {
      alert("Error searching casts");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 space-y-6">
        <NeynarAuthButton />

        {user && (
          <>
            <div className="flex items-center gap-4">
              {user.pfp_url && (
                <Image
                  src={user.pfp_url}
                  width={50}
                  height={50}
                  alt="User Profile Picture"
                  className="rounded-full"
                />
              )}
              <p className="text-xl font-semibold text-black">
                {user?.display_name}
              </p>
            </div>
            <p className="text-sm text-gray-500 text-center mt-2">
              Clear out your feed and save storage! Use the buttons below to search your casts and delete any $DEGEN tips created before {deleteBeforeDate.toLocaleDateString()}, in line with the end of the previous season.
            </p>
            <button
              onClick={handleSearchCasts}
              className="w-full mt-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition-colors duration-200 ease-in-out"
              disabled={searchLoading}
            >
              {searchLoading ? "Searching casts..." : "Search for $DEGEN casts"}
            </button>
            <button
              onClick={handleDeleteCast}
              className="w-full mt-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition-colors duration-200 ease-in-out"
              disabled={deleteLoading || matches.length === 0}
            >
              {deleteLoading ? "Deleting casts..." : "Delete $DEGEN casts"}
            </button>
            {deleteResult !== null && (
              <p className="mt-4 text-lg font-semibold text-center text-black">
                Number of casts deleted: {deleteResult}
              </p>
            )}
            {matches.length > 0 ? (
              <p className="mt-4 text-lg font-semibold text-center text-black">
                Number of $DEGEN casts: {totalMatches}
                <br />
                Number of deletable casts: {deletableMatches}
              </p>
            ) : (
              noMatchesFound && (
                <p className="mt-4 text-lg font-semibold text-center text-black">
                  No $DEGEN casts found.
                </p>
              )
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Did it work? Cast to FC and share!"
              rows={2}
              className="w-full p-2 mt-4 rounded-md border text-center border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
            />
            <button
              onClick={handlePublishCast}
              className="w-full mt-4 py-2 bg-indigo-500 text-white rounded-md shadow-md hover:bg-indigo-600 transition-colors duration-200 ease-in-out"
            >
              Cast
            </button>
            <a
              href="https://www.farcaster.id/h3lx.eth"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-center text-blue-500 hover:underline"
            >
              Follow me on Farcaster! @h3lx.eth
            </a>
          </>
        )}
      </div>
    </main>
  );
}
