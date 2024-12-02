export type ReceiveChunkMessage = {
  type: "receive-chunk"
  payload: { response: string }
}
