// The adapter binds .wasm imports as pre-compiled modules at deploy time —
// Workers refuse to compile WebAssembly from a buffer at runtime.
declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}
