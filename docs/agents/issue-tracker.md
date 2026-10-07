# Issue tracker: Local Markdown

Matt skill working artifacts live locally as Markdown files in ignored `.scratch/`.
They are not release files and must not be committed. Keep durable project
specifications under `docs/project-management/` when they need to be shared.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Triage state is recorded as a `Status:` line near the top of an issue file
- Comments and conversation history are appended under a `## Comments` heading

When a skill says to publish to the issue tracker, create the corresponding Markdown file under `.scratch/<feature-slug>/`.
