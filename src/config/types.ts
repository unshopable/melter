import { z } from 'zod';

/**
 * A map of Shopify's directory structure and component types.
 *
 * @see [Shopify Docs Reference](https://shopify.dev/docs/themes/architecture#directory-structure-and-component-types)
 */
export const paths = z.object({
  /**
   * An array of paths pointing to files that should be processed as `assets`.
   */
  assets: z
    .array(z.string())
    .nonempty({ message: "Property '%path' expected at least %minimum element" }),

  /**
   * An array of paths pointing to files that should be processed as `config`.
   */
  config: z
    .array(z.string())
    .nonempty({ message: "Property '%path' expected at least %minimum element" }),

  /**
   * An array of paths pointing to files that should be processed as `layout`.
   */
  layout: z
    .array(z.string())
    .nonempty({ message: "Property '%path' expected at least %minimum element" }),

  /**
   * An array of paths pointing to files that should be processed as `locales`.
   */
  locales: z
    .array(z.string())
    .nonempty({ message: "Property '%path' expected at least %minimum element" }),

  /**
   * An array of paths pointing to files that should be processed as `sections`.
   */
  sections: z
    .array(z.string())
    .nonempty({ message: "Property '%path' expected at least %minimum element" }),

  /**
   * An array of paths pointing to files that should be processed as `snippets`.
   */
  snippets: z
    .array(z.string())
    .nonempty({ message: "Property '%path' expected at least %minimum element" }),

  /**
   * An array of paths pointing to files that should be processed as `templates`.
   */
  templates: z
    .array(z.string())
    .nonempty({ message: "Property '%path' expected at least %minimum element" }),
});

export type Paths = z.infer<typeof paths>;

/**
 * Compiler configuration object.
 */
export const config = z.object({
  /**
   * Where to look for files to compile.
   */
  input: z.string({
    invalid_type_error: "Property '%path' expected %expected, received %received",
  }),

  /**
   * Where to write the compiled files to.
   */
  output: z.string({
    invalid_type_error: "Property '%path' expected %expected, received %received",
  }),

  /**
   * Clean the output directory before compilation.
   */
  clean: z.boolean(),

  /**
   * Enter watch mode, which rebuilds on file change.
   */
  watch: z.boolean(),

  /**
   * A path mapping from `input` to `output`.
   */
  paths: paths,

  /**
   * A list of additional plugins to add to the compiler.
   */
  plugins: z.array(z.any()),
});

export type Config = z.infer<typeof config>;
