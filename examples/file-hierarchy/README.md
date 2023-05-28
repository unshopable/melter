# Melter File Hierarchy Example

> **Info**
> This is a proof of concept of a directory structure that mirrors Shopify's file hierarchy.

## Concept

Shopify has a distinctive file file hierarchy:

|     | Name          | Description                                                                      |
| --- | ------------- | -------------------------------------------------------------------------------- |
| 1   | Layout        | Used to place components that are shared across multiple templates.              |
| 2   | Template      | Controls what's displayed on a specific page, for instance index, cart, product. |
| 3   | Section Group | Groups multiple related sections.                                                |
| 4   | Section       | Reusable and customizable component.                                             |
| 5   | Snippet       | Reusable component.                                                              |

Some notes:

- Themes must have at least one layout ("theme")
- Templates must be related to a layout
- Section groups can not exist without sections
- Sections can be placed anywhere but can also be restricted to certain templates and/or sections groups
- Snippets don't have any regulations

This is how Shopify's default directory structure looks like:

```diff
  .
  ├── assets
  ├── config
  ├── layout
  │   └── theme.liquid
  ├── locales
  ├── sections
  │   ├── announcement-bar.liquid
  │   └── site-header.liquid
  ├── snippets
  └── templates
      └── cart.json
```

Doesn't seem to mirror everything we learned about theme architecture, does it? Now let's take a look at this:

```diff
  .
  ├── assets
  ├── config
- ├── layout
- │   └── theme.liquid
  ├── locales
  ├── sections
  │   ├── announcement-bar.liquid
  │   ├── header-group.json
  │   └── site-header.liquid
  ├── snippets
+ └── storefront
+     ├── (theme)
+     │   └── cart
+     │       └── template.json
+     └── layout.liquid
- └── templates
-     └── cart.json
```

We can go even further and incorporate section groups and section relations:

```diff
  .
  ├── assets
  ├── config
  ├── locales
  ├── sections
+ │   └── (header)
+ │       ├── announcement-bar.liquid
+ │       └── site-header.liquid
- │   ├── announcement-bar.liquid
- │   ├── header-group.json
- │   └── site-header.liquid
  ├── snippets
  └── storefront
      ├── (theme)
      │   └── cart
      │       └── template.json
      └── layout.liquid
```

You could also implement something that updates the section group JSON based on which files you place where so certain sections are only available within its specific context.
