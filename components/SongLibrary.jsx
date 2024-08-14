import { Button } from "./ui/button";
import { db } from "@/lib/indexeddb/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

export const SongLibrary = ({ song, setSong }) => {
  const [savedSongs, setSavedSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const allSongs = await db.songs.toArray();
      setSavedSongs(allSongs);
    };

    fetchSongs();
  }, []);

  const handleSaveSong = async () => {
    await db.songs.add({ title: song[0].lyrics[0], song });
    const updatedSongs = await db.songs.toArray();
    setSavedSongs(updatedSongs);
    toast("Song Saved!");
  };

  const handleDeleteSong = async (id) => {
    await db.songs.delete(id);
    const updatedSongs = await db.songs.toArray();
    setSavedSongs(updatedSongs);
    toast("Song Deleted!");
  };

  return (
    <div className="border rounded-lg">
      <Button
        className="hover:bg-slate-300 hover:text-black rounded-r-none border-r"
        onClick={handleSaveSong}
      >
        Save Song to Profile
      </Button>
      <Dialog>
        <DialogTrigger>View Saved Songs</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saved Songs</DialogTitle>
            <DialogDescription>
              <ScrollArea className="max-h-[60vh] overflow-y-scroll">
                {savedSongs.length > 0 ? (
                  savedSongs.map((e, index) => {
                    console.log(e);
                    return (
                      <div key={index} className="mb-4">
                        <strong>
                          {e.title} {e.id}
                        </strong>
                        {/* <pre className="whitespace-pre-wrap">{e.song.map(lyrics.join("\n")}</pre> */}
                        <pre className="whitespace-pre-wrap">
                          <ScrollArea className="max-h-[20vh] overflow-y-scroll">
                            {e.song &&
                              e.song
                                .map((component) => component.lyrics)
                                .join("\n")}
                          </ScrollArea>
                        </pre>
                        <div className="flex flex-row space-x-1">
                          <Button onClick={() => setSong(e.song)}>
                            Load song into editor
                          </Button>
                          <Button
                            className="bg-red-500"
                            onClick={() => handleDeleteSong(e.id)}
                          >
                            Delete Song
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No songs saved yet.</p>
                )}
              </ScrollArea>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
