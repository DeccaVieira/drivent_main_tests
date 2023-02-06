import { ApplicationError } from '@/protocols';

export function paymentError(): ApplicationError {
  return {
    name: "Payment Required",
    message: 'You must to make the payment',
  };
}
