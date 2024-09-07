import EventEmitter from "node:events";

export default class EventBus {
  private static _emitter: EventEmitter = new EventEmitter();

  static getEmitter() {
    return this._emitter;
  }
}
