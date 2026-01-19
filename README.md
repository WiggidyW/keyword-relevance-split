# keyword-relevance-split

Keyword-based relevance scoring that evaluates each keyword independently.

## Overview

This function evaluates how relevant content is to a set of keywords by creating a separate Vector Completion task for each keyword. An ensemble of LLMs votes on the relevance level for each keyword, and the results are averaged into a final score.

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keywords` | `string[]` | Yes | Keywords to evaluate relevance against (minimum 1) |
| `content` | `string \| image \| video \| audio \| file \| array` | Yes | Content to evaluate for relevance |

### Supported Content Types

- **Text** - Plain text strings
- **Image** - Image content
- **Video** - Video content
- **Audio** - Audio content
- **File** - File content
- **Array** - Multiple content pieces of any of the above types

## Output

A scalar value between 0 and 1:

| Score | Interpretation |
|-------|----------------|
| 1.0 | Extremely relevant to all keywords |
| 0.5 | Somewhat relevant |
| 0.0 | Not relevant |

## Example

```json
{
  "input": {
    "keywords": ["healthcare", "AI", "diagnostics"],
    "content": "Machine learning algorithms are increasingly being used to analyze medical imaging for early disease detection."
  }
}
```

## How It Works

1. **Task Mapping**: Creates one Vector Completion task per keyword using `input_maps`

2. **Prompt Construction**: Each keyword gets its own prompt:
   ```
   How relevant is the following content with regards to "healthcare":

   "[content]"
   ```

3. **Ensemble Voting**: For each keyword, multiple LLMs vote on one of three responses:
   - "Extremely Relevant"
   - "Somewhat Relevant"
   - "Not Relevant"

4. **Score Calculation**:
   ```
   per_keyword_score = scores[Extremely Relevant] + (scores[Somewhat Relevant] * 0.5)
   final_score = average(all per_keyword_scores)
   ```

## Default Profile

The default profile uses 11 LLMs with **equal weights** (non-reasoning):

| Model | Output Mode | Notes |
|-------|-------------|-------|
| `openai/gpt-4.1-nano` | json_schema | Default, temp 0.75, temp 1.25 |
| `google/gemini-2.5-flash-lite` | json_schema | Default, temp 0.75, temp 1.25 |
| `x-ai/grok-4.1-fast` | json_schema | Default, temp 0.75, temp 1.25 (reasoning disabled) |
| `deepseek/deepseek-v3.2` | instruction | count=3, with logprobs |
| `openai/gpt-4o-mini` | json_schema | count=3, with logprobs |

All models have equal weight (1.0) in the ensemble.

## When to Use

Use `keyword-relevance-split` when:
- You need granular per-keyword relevance assessment
- Keywords are independent concepts that should be evaluated separately
- You want to identify which specific keywords the content relates to

## Trade-offs

| Aspect | Split | Joined |
|--------|-------|--------|
| Completions | One per keyword per Ensemble LLM | One per Ensemble LLM |
| Granularity | Per-keyword scores available | Single holistic score |
| Keyword relationships | Evaluated independently | Considered together |

## Related Functions

- [WiggidyW/keyword-relevance](https://github.com/WiggidyW/keyword-relevance) - Combined joined + split evaluation
- [WiggidyW/keyword-relevance-joined](https://github.com/WiggidyW/keyword-relevance-joined) - Single-prompt evaluation
