"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const systemPrompts = {
  popstar: "popstar",
  rapper: "rapper",
  electropopStar: "electropopStar",
};

const userPrompts = {
  verse: "VERSE",
  chorus: "CHORUS",
  // bridge: "BRIDGE",
};

export const SongComponent = ({
  component,
  i,
  handleLineLimitChange,
  handleSystemPromptChange,
  handleUserPromptChange,
  handleRangeChange,
  handleMeterClick,
  handleRemoveMeter,
  handleAddMeter,
}) => {
  return (
    <div
      className={`border border-white p-10 m-5 w-80 peer component-${i.toString()} group`}
    >
      <div>
        Line Limit:{" "}
        <input
          type="number"
          value={component.lineLimit}
          onChange={(e) => handleLineLimitChange(i, e)}
          min="1"
          className="bg-black text-white border border-white rounded px-2 w-12"
        />
      </div>
      <div>
        Songwriter personality:{" "}
        <select
          value={component.selectedSystemPrompt}
          onChange={(e) => handleSystemPromptChange(i, e)}
          className="bg-black text-white border border-white rounded px-2"
        >
          {Object.entries(systemPrompts).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div>
        User Prompt:{" "}
        <select
          value={component.selectedUserPrompt}
          onChange={(e) => handleUserPromptChange(i, e)}
          className="bg-black text-white border border-white rounded px-2"
        >
          {Object.entries(userPrompts).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col justify-center items-center">
        <h1 className="font-semibold my-2">
          Meter{" "}
          <HoverCard>
            <HoverCardTrigger className="font-light underline cursor-pointer text-blue-200">
              ?
            </HoverCardTrigger>
            <HoverCardContent className="font-light">
              Each item in the meter array represents a separate line. An up
              facing carat represents a stressed syllable, and down represents
              an unstressed syllable. Click on them to change the stress.
            </HoverCardContent>
          </HoverCard>
        </h1>

        <div className="flex flex-col justify-center items-center">
          {component.meter.map((meter, j) => (
            <div
              key={j}
              className="flex flex-col px-3 justify-center items-center outline my-2 py-2"
            >
              <input
                type="range"
                min="1"
                max="16"
                value={meter.length}
                onChange={(e) => handleRangeChange(i, j, e)}
              />
              <div className="flex flex-row">
                {meter.map((value, k) => (
                  <button
                    key={k}
                    className={
                      value === 0
                        ? "rotate-180 text-xl px-1 hover:bg-white hover:text-black"
                        : "text-xl px-1 hover:bg-white hover:text-black"
                    }
                    onClick={() => handleMeterClick(i, j, k)}
                  >
                    ^
                  </button>
                ))}
                <span className="mx-4">{meter.length}</span>
              </div>
              <button
                className={`${
                  component.meter.length === 1 ? "text-gray-500" : ""
                } hover:text-red-500 underline`}
                onClick={() => handleRemoveMeter(i, j)}
                disabled={component.meter.length === 1}
              >
                Remove Meter Array
              </button>
            </div>
          ))}
          <button
            className="bg-green-500 text-white px-2 py-1 rounded mt-2"
            onClick={() => handleAddMeter(i)}
          >
            Add Meter
          </button>
        </div>
      </div>
    </div>
  );
};
