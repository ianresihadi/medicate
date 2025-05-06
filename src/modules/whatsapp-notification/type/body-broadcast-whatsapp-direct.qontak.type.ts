export type TBodyBroadcastWhatsappDirect = {
  to_number: string;
  to_name: string;
  message_template_id: string;
  channel_integration_id: string;
  language: {
    code: string;
  };
  parameters: {
    body: [
      {
        key: string;
        value_text: string;
        value: string;
      },
      {
        key: string;
        value_text: string;
        value: string;
      }
    ];
  };
};
