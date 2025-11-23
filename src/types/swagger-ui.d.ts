declare module 'swagger-ui-dist' {
  // Minimal config type – extend as needed
  export interface SwaggerUIConfig {
    domNode?: HTMLElement;
    dom_id?: string;
    url?: string;
    [key: string]: unknown;
  }

  export function SwaggerUIBundle(config: SwaggerUIConfig): unknown;
  export const SwaggerUIStandalonePreset: unknown;

  const swagger: {
    SwaggerUIBundle: typeof SwaggerUIBundle;
    SwaggerUIStandalonePreset: typeof SwaggerUIStandalonePreset;
  };

  export default swagger;
}
