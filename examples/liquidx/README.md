# LiquidX Full Example

## Getting started

First, install all dependencies by running:

```sh
$ npm install
```

Next, copy `shopify.theme.toml.example`, rename it to `shopify.theme.toml`, and update its placeholder contents:

```diff
  [environments.development]
- store = "<STORE_HANDLE>"
- password = "<THEME_ACCESS_PASSWORD>"
+ store = "my-store-handle"
+ password = "shptka_123"
  path = "dist"
```

Now run:

```sh
$ npm run dev
```

Finally, open `src/layout.theme.liquid` and update its content:

```diff
 <!doctype html>

 <html lang="{{ request.locale.iso_code }}">
   <head>
     <meta charset="utf-8">
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">

     <title>{{ page_title }}</title>

     {{ content_for_header }}
   </head>

   <body>
-    <Hello />
+    <Hello>World</Hello>

     <main>
       {{ content_for_layout }}
     </main>
   </body>
 </html>
```
