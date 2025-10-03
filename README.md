# Svelte Brace

A lightweight Svelte component for handling curly brace expressions in text content.

## Installation

```sh
npm install svelte-brace
```

## Usage

```svelte
<script>
  import { Bracer } from 'svelte-brace';

  let name = 'world';
</script>

<Bracer template="Hello {name}!" />
```

The `Bracer` component allows you to render text content with curly brace expressions, similar to Svelte's native template syntax. It's useful when you need to handle dynamic text content that includes curly brace expressions.

## API

### Props

- `template` (string) - Required. The text content containing curly brace expressions.
- `replacer` (function) - Optional. A function that receives the expression and returns the replacement value. By default, it evaluates the expression in the component's context.

## Examples

```svelte
<!-- Basic usage -->
<Bracer template="Count: {count}" />

<!-- Custom replacer -->
<Bracer 
  template="Total: {amount}"
  replacer={(expr) => `$${eval(expr)}.00`}
/>

<!-- Nested expressions -->
<Bracer template="User {user.name} has {user.points} points" />
```
