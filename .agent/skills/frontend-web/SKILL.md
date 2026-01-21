---
name: Frontend Web Developer
description: Guidelines for Next.js web development on DigiSecond marketplace - App Router, Tailwind, tRPC client
---

# Frontend Web Developer Skill

## Your Scope

You own the **Next.js web application**:

```
src/app/              # Pages and layouts (App Router)
src/components/       # Shared React components
src/styles/           # Global styles, Tailwind config
public/               # Static assets
```

> **IMPORTANT**: Use shared design tokens for colors and typography. See: `.agent/skills/shared-design-tokens/SKILL.md`

---

## Workflow: Adding a New Page

### 1. Check spec.md for requirements

```bash
cat docs/spec.md | grep -A 10 "User Story"
```

### 2. Create the route

```typescript
// src/app/listings/[id]/page.tsx
import { api } from "~/trpc/server";

interface Props {
  params: { id: string };
}

export default async function ListingPage({ params }: Props) {
  const listing = await api.listing.getById({ id: params.id });
  
  return (
    <main className="container mx-auto px-4 py-8">
      <ListingDetails listing={listing} />
    </main>
  );
}
```

### 3. Create components

```typescript
// src/components/listings/ListingDetails.tsx
"use client";

import { type RouterOutputs } from "~/trpc/shared";
import Image from "next/image";

type Listing = RouterOutputs["listing"]["getById"];

export function ListingDetails({ listing }: { listing: Listing }) {
  return (
    <article className="grid md:grid-cols-2 gap-8">
      {/* Photo gallery */}
      <div className="space-y-4">
        {listing.photos.map((photo, i) => (
          <Image
            key={i}
            src={photo}
            alt={`${listing.title} photo ${i + 1}`}
            width={800}
            height={600}
            className="rounded-lg object-cover"
          />
        ))}
      </div>
      
      {/* Details */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{listing.title}</h1>
        <p className="text-2xl font-semibold text-green-600">
          Rp {listing.price.toLocaleString("id-ID")}
        </p>
        <p className="text-gray-600">{listing.description}</p>
        
        <BuyButton listingId={listing.id} />
      </div>
    </article>
  );
}
```

---

## Workflow: Using tRPC Client

### Server Components (preferred)

```typescript
// src/app/listings/page.tsx
import { api } from "~/trpc/server";

export default async function ListingsPage() {
  // Direct server call - no loading state needed
  const listings = await api.listing.search({ limit: 24 });
  
  return <ListingGrid listings={listings} />;
}
```

### Client Components

```typescript
// src/components/listings/SearchBar.tsx
"use client";

import { api } from "~/trpc/react";
import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  
  // React Query integration
  const { data, isLoading, refetch } = api.listing.search.useQuery(
    { query, limit: 24 },
    { enabled: query.length > 0 }
  );
  
  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search listings..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      
      {isLoading && <Spinner />}
      {data && <ListingGrid listings={data} />}
    </div>
  );
}
```

### Mutations

```typescript
// src/components/listings/CreateListingForm.tsx
"use client";

import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createListingSchema } from "~/lib/schemas";

export function CreateListingForm() {
  const form = useForm({
    resolver: zodResolver(createListingSchema),
  });
  
  const createListing = api.listing.create.useMutation({
    onSuccess: (data) => {
      // Redirect to new listing
      router.push(`/listings/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const onSubmit = form.handleSubmit((data) => {
    createListing.mutate(data);
  });
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Form fields */}
      <button
        type="submit"
        disabled={createListing.isPending}
        className="btn btn-primary"
      >
        {createListing.isPending ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
}
```

---

## Component Library Standards

### File Structure

```
src/components/
├── ui/                    # Generic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── index.ts           # Barrel export
├── listings/              # Feature-specific
│   ├── ListingCard.tsx
│   ├── ListingGrid.tsx
│   └── ListingDetails.tsx
├── transactions/
│   ├── TransactionCard.tsx
│   └── VerificationTimer.tsx
└── layout/
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

### Component Template

```typescript
// src/components/ui/Button.tsx
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          // Variants
          variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
          variant === "secondary" && "bg-gray-200 text-gray-800 hover:bg-gray-300",
          variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
          // Sizes
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2",
          size === "lg" && "px-6 py-3 text-lg",
          // States
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

---

## Tailwind CSS Guidelines

### Design Tokens (in tailwind.config.ts)

Use the shared design tokens from `.agent/skills/shared-design-tokens/SKILL.md`:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#22c55e",
          "primary-dark": "#16a34a",
          secondary: "#3b82f6",
          "secondary-dark": "#2563eb",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  px-4 py-6           // Mobile
  md:px-6 md:py-8     // Tablet
  lg:px-8 lg:py-12    // Desktop
">
```

### Dark Mode (if needed)

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

---

## Form Handling with React Hook Form + Zod

### Shared Schema

```typescript
// src/lib/schemas.ts
import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20).max(5000),
  price: z.number().int().min(1000, "Minimum price is Rp 1,000"),
  categoryId: z.string().uuid(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
```

### Form Component

```typescript
// src/components/listings/CreateListingForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createListingSchema, type CreateListingInput } from "~/lib/schemas";

export function CreateListingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          {...register("title")}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>
    </form>
  );
}
```

---

## Image Handling

### Upload to Supabase Storage

```typescript
// src/lib/upload.ts
import { createClient } from "@supabase/supabase-js";

export async function uploadListingPhoto(file: File, listingId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const fileName = `${listingId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("listing-photos")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });
  
  if (error) throw error;
  
  return supabase.storage.from("listing-photos").getPublicUrl(data.path).data.publicUrl;
}
```

### Display with Next.js Image

```typescript
import Image from "next/image";

// Configure domains in next.config.js
<Image
  src={listing.photos[0]}
  alt={listing.title}
  width={400}
  height={300}
  className="rounded-lg object-cover"
  priority // for above-the-fold images
/>
```

---

## Testing

### Component Tests (Vitest + Testing Library)

```typescript
// src/components/listings/__tests__/ListingCard.test.tsx
import { render, screen } from "@testing-library/react";
import { ListingCard } from "../ListingCard";

describe("ListingCard", () => {
  it("renders listing title and price", () => {
    const listing = {
      id: "1",
      title: "ML Account",
      price: 500000,
      photos: ["/test.jpg"],
    };
    
    render(<ListingCard listing={listing} />);
    
    expect(screen.getByText("ML Account")).toBeInTheDocument();
    expect(screen.getByText("Rp 500.000")).toBeInTheDocument();
  });
});
```

### Run Tests

```bash
# Run component tests
pnpm test src/components

# Run with watch mode
pnpm test --watch
```

---

## Accessibility Checklist

- [ ] All images have `alt` text
- [ ] Form inputs have `<label>` elements
- [ ] Interactive elements are `<button>` or `<a>`, not `<div>`
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus states visible on all interactive elements
- [ ] Skip links for keyboard navigation
- [ ] ARIA labels where semantic HTML insufficient

---

## Coordination

- **Backend ready**: Check if tRPC procedure exists before building UI
- **Mock data**: Use `msw` to mock APIs while backend implements
- **Mobile parity**: Share Zod schemas with mobile via `src/lib/schemas.ts`
- **Design system**: Keep UI components in sync with mobile (colors, spacing)
