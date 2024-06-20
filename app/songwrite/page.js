"use client";

const fetchData = async () => {
  const response = await fetch(
    "https://c346-65-130-165-212.ngrok-free.app/generate-song",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        songComponents: [
          {
            lineLimit: 8,
            meter: [
              [0, 1, 0, 1],
              [0, 1, 0, 1],
            ],
            selectedSystemPrompt: "rapper",
            selectedUserPrompt: "VERSE",
          },
          {
            lineLimit: 4,
            meter: [[0, 1, 0, 1]],
            selectedSystemPrompt: "rapper",
            selectedUserPrompt: "CHORUS",
          },
          {
            lineLimit: 8,
            meter: [
              [0, 1, 0, 1, 1, 0, 1, 0],
              [0, 1, 1, 0],
            ],
            selectedSystemPrompt: "rapper",
            selectedUserPrompt: "VERSE",
          },
          {
            lineLimit: 8,
            meter: [
              [0, 1, 0, 1, 1],
              [0, 1, 0, 1, 0, 1],
            ],
            selectedSystemPrompt: "rapper",
            selectedUserPrompt: "CHORUS",
          },
          {
            lineLimit: 6,
            meter: [
              [0, 1, 0, 1],
              [0, 1, 0, 1, 0, 1],
            ],
            selectedSystemPrompt: "rapper",
            selectedUserPrompt: "VERSE",
          },
          {
            lineLimit: 8,
            meter: [
              [0, 1, 0, 1, 1],
              [0, 1, 0, 1, 0, 1],
            ],
            selectedSystemPrompt: "rapper",
            selectedUserPrompt: "CHORUS",
          },
        ],
      }),
    }
  );
  console.log(response);
  return response.json();
};

export default function Page() {
  return (
    <div>
      songwrite
      <button onClick={fetchData}>fetch</button>
    </div>
  );
}
