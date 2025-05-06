export enum ETokenType {
  penambahan = "penambahan",
  pengurangan = "pengurangan",
}

export enum ETokenDescription {
  add = "Trigger by add quota action",
  void = "Trigger by void quota action",
  paid = "Trigger by paid action",
}

export enum EStatusApprovalConsulate {
  approve = "approve",
  reject = "reject",
  pending = "pending",
}

export enum EMCUAttachmentType {
  indonesian_identity_card = "indonesian_identity_card",
  pasport = "pasport",
  supporting_files = "supporting_files",
}

export enum EMCUStatusResult {
  fit = "fit",
  unfit = "unfit",
}

export enum EOrderStatus {
  pending = "pending",
  paid = "paid",
  canceled = "canceled",
  expired = 'expired',
  waiting_mcu_result = "waiting_mcu_result",
  mcu_release = "mcu_release",
  certificate_issued = "certificate_issued",
}

export enum EStatusData {
  active = "active",
  inactive = "inactive",
}

export enum EVfsStatus {
  checked_in = "checked_in",
  proceed = "proceed",
  reject = "reject",
}

export enum PaymentOrderStatus {
  inactive = 'inactive',
  active = 'active',
  paid = 'paid',
  expired = 'expired',
}

export enum EOrderStatusV2 {
  pending = "Belum Bayar",
  paid = "Sudah Bayar",
  canceled = "Dibatalkan",
  expired = 'Expired',
  waiting_mcu_result = "Menunggu Hasil MCU",
  mcu_release = "MCU Selesai",
  certificate_issued = "Sertifikat Terbit",
}
