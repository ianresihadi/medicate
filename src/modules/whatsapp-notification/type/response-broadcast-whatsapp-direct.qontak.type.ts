export type TResponseBroadcastWhatsappDirect = {
  status: string;
  data: {
    id: string;
    name: string;
    organization_id: string;
    channel_integration_id: string;
    contact_list_id: any | null;
    contact_id: string;
    target_channel: string;
    send_at: string;
    execute_status: string;
    execute_type: string;
    parameters: {
      header: object;
      body: object;
      buttons: object;
    };
    created_at: string;
    message_status_count: {
      failed: number;
      delivered: number;
      read: number;
      pending: number;
      sent: number;
    };
    contact_extra: {
      customer_name: string;
    };
    message_template: {
      id: string;
      organization_id: string;
      name: string;
      language: string;
      header: any | null;
      body: string;
      footer: any | null;
      buttons: object;
      status: string;
      category: string;
      quality_rating: any | null;
      quality_rating_text: string;
    };
    division_id: any | null;
    message_broadcast_error: string;
    sender_name: string;
    sender_email: string;
    channel_account_name: string;
    channel_phone_number: string;
  };
};
