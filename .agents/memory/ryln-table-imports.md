---
name: RYLN table import gotcha
description: shadcn/ui table component exports long-form names; design subagents tend to use wrong shorthand names
---

The shadcn/ui `table.tsx` component exports:
- `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`, `TableCaption`, `TableFooter`

**Not** the shorthand `Body`, `Cell`, `Head`, `Header`, `Row`.

**Why:** The design subagent (DESIGN subagent) generated dashboard files importing `{ Table, Body, Cell, Head, Header, Row }` from `@/components/ui/table` — these don't exist and cause Vite runtime errors.

**How to apply:** After any DESIGN subagent run that touches dashboard/table-heavy pages, grep for `Body,` in dashboard files and rename all to `TableBody` etc. The sed one-liner:
```bash
sed -i -e 's/  Body,/  TableBody,/' -e 's/  Cell,/  TableCell,/' -e 's/  Head,/  TableHead,/' -e 's/  Header,/  TableHeader,/' -e 's/  Row,/  TableRow,/' -e 's/<Body>/<TableBody>/g' ... file.tsx
```
