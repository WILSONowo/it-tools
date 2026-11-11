declare module 'figlet' {
  interface Options {
    font?: string;
    horizontalLayout?: string;
    verticalLayout?: string;
  }
  export function text(txt: string, cb: (err: Error | null, result?: string) => void): void;
  export function text(txt: string, options: Options, cb: (err: Error | null, result?: string) => void): void;
}
