
export interface Service {
  name: string;
  url: string | null;
}

export const predefinedServices: Service[] = [
  { name: "Почта", url: "https://mail.freshauto.ru/owa" },
  { name: "CRM", url: "https://crm.freshauto.ru" },
  { name: "CRM дилерский", url: "https://fresh.autocrm.ru" },
  { name: "Я.Трекер", url: "https://tracker.yandex.ru" },
  { name: "Тезис", url: "http://tezis.freshauto2.ru/app/#!" },
  { name: "AD/терминал", url: null },
  { name: "ТП - Центр поддержки", url: "https://tracker.freshauto.ru/servicedesk/customer/portals" },
  { name: "Другое", url: null }
];
