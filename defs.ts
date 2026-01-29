import { Functions } from "objectiveai";
import { ExampleInput } from "./example_input";

export const Function: Functions.RemoteFunction = {
  "type": "scalar.function",
  "description": "Keyword-based Relevance Scoring. Discover how relevant a piece of content is to specific keywords. Splits each keyword into a separate Vector Completion Task.",
  "input_schema": {
    "type": "object",
    "properties": {
      "keywords": {
        "type": "array",
        "description": "Keywords to evaluate relevance against.",
        "minItems": 1,
        "items": {
          "type": "string",
          "description": "A keyword to evaluate relevance against."
        }
      },
      "content": {
        "anyOf": [
          {
            "type": "string",
            "description": "Text content to be evaluated for relevance."
          },
          {
            "type": "image",
            "description": "Image content to be evaluated for relevance."
          },
          {
            "type": "video",
            "description": "Video content to be evaluated for relevance."
          },
          {
            "type": "audio",
            "description": "Audio content to be evaluated for relevance."
          },
          {
            "type": "file",
            "description": "File content to be evaluated for relevance."
          },
          {
            "type": "array",
            "description": "Array of content pieces to be evaluated for relevance.",
            "minItems": 1,
            "items": {
              "anyOf": [
                {
                  "type": "string",
                  "description": "Text content to be evaluated for relevance."
                },
                {
                  "type": "image",
                  "description": "Image content to be evaluated for relevance."
                },
                {
                  "type": "video",
                  "description": "Video content to be evaluated for relevance."
                },
                {
                  "type": "audio",
                  "description": "Audio content to be evaluated for relevance."
                },
                {
                  "type": "file",
                  "description": "File content to be evaluated for relevance."
                }
              ]
            }
          }
        ]
      }
    },
    "required": ["keywords", "content"]
  },
  "input_maps": {
    "$jmespath": "to_array(input.keywords)"
  },
  "tasks": [
    {
      "type": "vector.completion",
      "map": 0,
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": {
                "$jmespath": "join('',['How relevant is the following content with regards to \"',map,'\":\n\n\"'])"
              }
            },
            {
              "$jmespath": "input_value_switch(input.content,`null`,&[].input_value_switch(@,`null`,`null`,&{type:'text',text:@},`null`,`null`,`null`,@,@,@,@),&{type:'text',text:@},`null`,`null`,`null`,input.content,input.content,input.content,input.content)"
            },
            {
              "type": "text",
              "text": "\""
            }
          ]
        }
      ],
      "responses": ["Extremely Relevant", "Somewhat Relevant", "Not Relevant"]
    }
  ],
  "output": {
    "$jmespath": "avg(tasks[0][].add(scores[0],multiply(scores[1],`0.5`)))"
  }
};

export const Profile: Functions.RemoteProfile = {
  "description": "The default profile for `WiggidyW/keyword-relevance-split`. Non-Reasoning. Supports multi-modal content.",
  "tasks": [
    {
      "ensemble": {
        "llms": [
          {
            "model": "openai/gpt-4.1-nano",
            "output_mode": "json_schema"
          },
          {
            "model": "openai/gpt-4.1-nano",
            "output_mode": "json_schema",
            "temperature": 0.75
          },
          {
            "model": "openai/gpt-4.1-nano",
            "output_mode": "json_schema",
            "temperature": 1.25
          },
          {
            "model": "google/gemini-2.5-flash-lite",
            "output_mode": "json_schema"
          },
          {
            "model": "x-ai/grok-4.1-fast",
            "output_mode": "json_schema",
            "temperature": 0.75,
            "reasoning": {
              "enabled": false
            }
          },
          {
            "model": "x-ai/grok-4.1-fast",
            "output_mode": "json_schema",
            "temperature": 1.25,
            "reasoning": {
              "enabled": false
            }
          },
          {
            "count": 3,
            "model": "deepseek/deepseek-v3.2",
            "output_mode": "instruction",
            "top_logprobs": 20
          },
          {
            "model": "google/gemini-2.5-flash-lite",
            "output_mode": "json_schema",
            "temperature": 0.75
          },
          {
            "model": "google/gemini-2.5-flash-lite",
            "output_mode": "json_schema",
            "temperature": 1.25
          },
          {
            "count": 3,
            "model": "openai/gpt-4o-mini",
            "output_mode": "json_schema",
            "top_logprobs": 20
          },
          {
            "model": "x-ai/grok-4.1-fast",
            "output_mode": "json_schema",
            "reasoning": {
              "enabled": false
            }
          }
        ]
      },
      "profile": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    }
  ]
};

export const ExampleInputs: ExampleInput[] = [
  {
    value: {
      keywords: ["TypeScript", "React", "frontend development"],
      content: "We migrated our entire codebase from JavaScript to TypeScript last quarter. The React components now have proper type definitions, reducing runtime errors by approximately 60% according to our monitoring dashboards."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 3,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["wine tasting", "vineyards", "Napa Valley"],
      content: "Instructions for assembling IKEA bookshelf model BILLY: 1. Lay all pieces on floor. 2. Locate cam locks and wooden dowels. 3. Insert dowels into pre-drilled holes. 4. Attach side panels to base."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 3,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["photography"],
      content: "The golden hour—that magical time just after sunrise or before sunset—offers photographers the most flattering natural light. Shadows become softer, colors warmer, and even amateur shots can look professional."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 1,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["dogs", "pet care"],
      content: "Wolves are the ancestors of domestic dogs, sharing approximately 99% of their DNA. However, thousands of years of selective breeding have created vast behavioral and physical differences between the species."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 2,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["investment banking", "mergers acquisitions", "IPO", "hedge funds"],
      content: "lol my piggy bank is getting pretty full!! almost have enough coins saved up 2 buy that new video game ive been wanting 🐷💰"
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 4,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["classical music", "Beethoven"],
      content: "The Ninth Symphony, completed in 1824 while the composer was almost entirely deaf, remains one of humanity's greatest artistic achievements. The final movement's 'Ode to Joy' theme has become a universal anthem for brotherhood."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 2,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["vegan recipes", "plant-based diet"],
      content: "Mmm nothing beats a juicy ribeye steak cooked medium-rare with a side of buttery mashed potatoes and bacon-wrapped asparagus! This steakhouse is definitely worth the splurge."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 2,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["running", "marathon training"],
      content: "i walked to the fridge like 5 times today does that count as cardio?? asking for a friend who definitely isnt me sitting on this couch rn"
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 2,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["architecture", "modernism", "Le Corbusier"],
      content: "The Villa Savoie (1931) exemplifies the Five Points of Architecture: pilotis, roof garden, free plan, horizontal windows, and free façade. This reinforced concrete structure near Paris became a manifesto of the International Style."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 3,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      keywords: ["knitting", "yarn crafts"],
      content: "Grandma's blanket has a weird hole in it. Not sure if the cat did it or if it's just old. Might throw it out tbh, it smells kinda musty anyway."
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: 2,
      },
    ],
    outputLength: null,
  },
];
