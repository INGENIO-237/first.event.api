import "reflect-metadata";
import EventBus from "./event-bus";
import Container from "typedi";
import UsersHooks from "./users.hooks";
import MailsHooks from "./mails.hooks";
import PaymentsHooks from "./payments.hooks";

export default function registerEvents() {
  const emitter = EventBus.getEmitter();

  // Hooks
  const usersHooks = Container.get(UsersHooks);
  const mailsHooks = Container.get(MailsHooks);
  const paymentsHooks = Container.get(PaymentsHooks);

  // Registrations
  usersHooks.registerListeners(emitter);
  mailsHooks.registerListeners(emitter);
  paymentsHooks.registerListeners(emitter);
}
