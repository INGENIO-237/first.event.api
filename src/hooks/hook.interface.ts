import { EventEmitter } from "node:events";

export default interface IHook {
  getEmitter: () => EventEmitter;
  emit: (event: any, data: any) => void;
  register: (emitter: EventEmitter) => void;
}
