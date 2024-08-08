"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { USER_PROMPTS as userPrompts } from "@/lib/constants/user-prompts";

const systemPrompts = {
  popstar: "popstar",
  rapper: "rapper",
  electropopStar: "electropopStar",
  rockstar: "rockstar",
  countryArtist: "countryArtist",
  custom: "custom",
};

export const SongComponent = ({
  component,
  i,
  handleSystemPromptChange,
  handleUserPromptChange,
  handleRangeChange,
  handleMeterClick,
  handleRemoveMeter,
  handleAddMeter,
  handleCustomSystemPromptChange,
  setComponents,
  songLength,
}) => {
  const handleLineLimitChange = (e) => {
    const newLineLimit = parseInt(e.target.value, 10);
    setComponents((prevComponents) =>
      prevComponents.map((component, index) =>
        index === i ? { ...component, lineLimit: newLineLimit } : component
      )
    );
  };

  const handleRhymeSchemeChange = (e) => {
    setComponents((prevComponents) =>
      prevComponents.map((component, index) =>
        index === i ? { ...component, rhymeScheme: e.target.value } : component
      )
    );
  };

  return (
    <Accordion
      className={`border border-white p-4 m-5 w-80 peer component-${i.toString()} group`}
      type="single"
      collapsible
      defaultValue="true"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>
          Component {i + 1}: {component.selectedUserPrompt} -{" "}
          {component.lineLimit} lines
        </AccordionTrigger>
        <AccordionContent>
          <div>
            <label>Line Limit:</label>
            <input
              type="number"
              value={component.lineLimit}
              onChange={(e) => handleLineLimitChange(e)}
              min="1"
              className="bg-black text-white border border-white rounded px-2 w-12"
            />
          </div>
          <div className="flex flex-col items-center">
            <label>Rhyme Scheme:</label>
            <input
              placeholder="AABB"
              value={component.rhymeScheme}
              onChange={handleRhymeSchemeChange}
              className="bg-black text-white border border-white rounded px-2"
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
            {component.selectedSystemPrompt === "custom" ? (
              <textarea
                className="text-black"
                value={component.customSystemPrompt}
                onChange={(e) => handleCustomSystemPromptChange(i, e)}
              />
            ) : null}
          </div>
          <div>
            Song Section:{" "}
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
              <HoverCard>
                <HoverCardTrigger className="font-bold underline cursor-pointer text-blue-200">
                  Meter
                </HoverCardTrigger>
                <HoverCardContent className="font-light">
                  Each item in the meter array represents a separate line. An up
                  facing carat represents a stressed syllable, and down
                  represents an unstressed syllable. Click on them to change the
                  stress.
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
        </AccordionContent>
      </AccordionItem>
      <button
        className="border hover:bg-red-500 hover:border-red-500 px-2 disabled:bg-gray-500 disabled:hover:border-white m-4"
        onClick={(event) => {
          event.preventDefault();
          setComponents((currentComponents) =>
            currentComponents.filter((_, index) => index !== i)
          );
        }}
        disabled={songLength === 1}
      >
        Remove Component
      </button>
    </Accordion>
  );
};
