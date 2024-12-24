import { InferSchemaType, Schema } from "mongoose";
import Event, { IEvent } from "../events/event.model";
import Payment, { IPayment } from "./payment.model";
import Refund from "./refund.model";
import { PAYMENT_STATUS } from "../../utils/constants/payments-and-subs";

const ticketPaymentSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  tickets: [
    {
      cat: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});

ticketPaymentSchema.pre<ITicketPayment>("save", async function (next) {
  let payment = this;

  const { event, tickets, amount, paymentIntent } = payment;

  const totalTickets = tickets.reduce(
    (acc, ticket) => acc + ticket.quantity,
    0
  );

  if (payment.isNew) {
    await Event.findByIdAndUpdate(event, {
      $inc: { ticketsSold: totalTickets },
    });

    if (paymentIntent != "free") {
      await Event.findByIdAndUpdate(event, {
        $inc: { revenue: amount },
      });
    }

    const ev = (await Event.findById(event)) as IEvent;

    const remainingTickets = ev.remainingTickets - totalTickets;

    await Event.findByIdAndUpdate(event, {
      remainingTickets,
    });
  }

  // If payment fails
  if (
    payment.status == PAYMENT_STATUS.FAILED ||
    payment.status == PAYMENT_STATUS.EXPIRED
  ) {
    await Event.findByIdAndUpdate(event, {
      $inc: {
        ticketsSold: -totalTickets,
        revenue: -amount,
        remainingTickets: totalTickets,
      },
    });
  }

  next();
});

ticketPaymentSchema.virtual("refund").get(async function () {
  const payment = this as ITicketPayment;
  const refund = await Refund.findOne({
    $or: [{ payment: payment._id }, { paymentIntent: payment.paymentIntent }],
  });
  return refund;
});

export interface ITicketPayment
  extends IPayment,
    InferSchemaType<typeof ticketPaymentSchema> {
  refund: InstanceType<typeof Refund> | null;
}

const TicketPayment = Payment.discriminator<ITicketPayment>(
  "TicketPayment",
  ticketPaymentSchema
);

export default TicketPayment;
