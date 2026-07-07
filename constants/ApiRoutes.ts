import { AppConfig } from "./AppConfig";

const BASE_URL = `${AppConfig.BACKEND_URL}`;


export const API_ROUTES = {
  AUTH: {
    LOGIN: `${BASE_URL}/api/salesman/auth/login`,
    SIGNUP: `${BASE_URL}/api/salesman/auth/signup`,
    ME: `${BASE_URL}/api/salesman/auth/me`,
    GET_OTP: `${BASE_URL}/api/admin/auth/get-otp`,
    VERIFY_OTP: `${BASE_URL}/api/admin/auth/verify-otp`,
    REFRESH: `${BASE_URL}/api/salesman/auth/login/refresh`,
    EDIT: `${BASE_URL}/api/salesman/auth/edit`,
  },
  ATTENDENCE: {
    CHECK_IN: `${BASE_URL}/api/salesman/attendence/checkin`,
    CHECK_OUT: `${BASE_URL}/api/salesman/attendence/checkout`,
    IS_CHECKED_IN: `${BASE_URL}/api/salesman/attendence/ischeckedin`,
    GET_INDEX: `${BASE_URL}/api/salesman/get/index`,
    GET_MY_LEADERBOARD: `${BASE_URL}/api/salesman/get/my/leaderboard`,
    GET_MY_OWING: `${BASE_URL}/api/salesman/get/my/owing`,
    APPLY_FOR_LEAVE: `${BASE_URL}/api/salesman/attendence/apply/leave`,
    GET_MY_LEAVES: `${BASE_URL}/api/salesman/get/my/leave`,
  },
  CUSTOMER: {
    CREATE: `${BASE_URL}/api/salesman/create/customer`,
    GET_CUSTOMER_TYPE: `${BASE_URL}/api/salesman/get/customer/type`,
    CREATE_ORDER: `${BASE_URL}/api/salesman/create/customer/order`,
    GET_ORDERS: (customerId: string) => `${BASE_URL}/api/salesman/get/order/${customerId}`,
    GET_CUSTOMER: (customerId: string) => `${BASE_URL}/api/salesman/get/customer/${customerId}`,
    IS_VISITED_LOCATION: (customerId: string) => `${BASE_URL}/api/salesman/get/is/visited/location/${customerId}`,
    ADD_VISITED_LOCATION: `${BASE_URL}/api/salesman/add/visited/location`,
    CHECKOUT_VISITED_LOCATION: `${BASE_URL}/api/salesman/checkout/visited/location`,
    UPDATE_ORDER_COLLECTION: `${BASE_URL}/api/salesman/update/order/collection`,
    GET_ORDER_COLLECTION: (orderId: string, customerId: string) =>
      `${BASE_URL}/api/salesman/get/order/collection/${orderId}/${customerId}`,
    GET_CUSTOMER_COLLECTION: (customerId: string) =>
      `${BASE_URL}/api/salesman/get/customer/collection/${customerId}`,
    DELIVER: (customerId: string, orderId: string) =>
      `${BASE_URL}/api/salesman/deliver/${customerId}/${orderId}`,
    CREATE_SHELF_HISTORY: `${BASE_URL}/api/salesman/create/customer/shelf/history`,
    GET_VISITED_CUSTOMERS: `${BASE_URL}/api/salesman/get/route/vistied/customers`,
    GET_ORDERED_CUSTOMERS: `${BASE_URL}/api/salesman/get/route/ordered/customers`,
    UPDATE_CUSTOMER_IMAGE: `${BASE_URL}/api/salesman/update/customer/images`,
  },
  ROUTE: {
    GET_ROUTE: `${BASE_URL}/api/get/route`,
    GET_ROUTE_CUSTOMERS: (routeId: string) => `${BASE_URL}/api/get/route/${routeId}`,
    GET_POSSIBLE_OUTLETS: (salesmanId: string) => `${BASE_URL}/api/get/possible/outlets/${salesmanId}`,
    GET_ALL_OUTLET_STATS: `${BASE_URL}/api/salesman/get/all/outlet/stats`
  },
  PRODUCT: {
    GET_PRODUCTS_WITH_PRICES: (type?: string) => `${BASE_URL}/api/salesman/get/products/with-prices/${type}`,
  },
  UPLOAD: {
    PRE_SIGNED_URL: `${BASE_URL}/api/upload/presigned`,
  },
  CITY_HEAD: {
    MY_DISTRIBUTORS: `${BASE_URL}/api/salesman/get/my/distributor`,
    GET_DISTRIBUTOR_DETAILS: (distributorId: string) =>
      `${BASE_URL}/api/salesman/get/distributor/details/${distributorId}`,
    UPDATE_DISTRIBUTOR_DETAILS: `${BASE_URL}/api/salesman/update/distributor/details`,
    GET_DISTRIBUTOR_LEDGER: (distributorId: string) =>
      `${BASE_URL}/api/salesman/get/ledger/${distributorId}`,
    ORDER: {
      CREATE: `${BASE_URL}/api/distributor/create/distributor/order`,
      GET: (distributorId: string) =>
        `${BASE_URL}/api/distributor/get/orders/${distributorId}`,
      GET_INVOICES: (distributorId: string) =>
        `${BASE_URL}/api/distributor/get/distributor/invoices/${distributorId}`,
      RECEIVE_INVOICE_ITEMS: `${BASE_URL}/api/distributor/receive/invoice/items`,
      UPDATE_STOCK: `${BASE_URL}/api/salesman/stock/update-closing`,
      UPDATE_CUSTOMER_STOCK: `${BASE_URL}/api/salesman/stock/customer/update-closing`,
      GET_ADMIN_ORDERS: (distributorId: string) =>
        `${BASE_URL}/api/salesman/get/admin/orders/${distributorId}`,
    },
    STT: {
      GET_TODAY: (distributorId: string) =>
        `${BASE_URL}/api/salesman/get/today/stt/${distributorId}`,
      GET_HISTORY: (distributorId: string) =>
        `${BASE_URL}/api/salesman/get/stt/history/${distributorId}`,
      GET_TODAY_CUSTOMER_STT: (customerId: string) =>
        `${BASE_URL}/api/salesman/get/today/customerstt/${customerId}`,
      GET_CUSTOMER_STT_HISTORY: (customerId: string) =>
        `${BASE_URL}/api/salesman/get/customerstt/history/${customerId}`,
    },
    SETTELMENT: {
      SALESMAN_SETTLEMENT: `${BASE_URL}/api/salesman/settelment`,
      GET_FOR_SETTLEMENT: `${BASE_URL}/api/salesman/get/for/settelment`,
      GET_SETTLEMENT_HISTORY: (salesmanId: string) =>
        `${BASE_URL}/api/salesman/get/settelment/history/${salesmanId}`,
    },
  },
  SALESMAN: {
    GET_MY_NOTIFICATION: `${BASE_URL}/api/salesman/my/notifications`,
    MARK_NOTIFICATION_AS_READ: (notificationId: string) =>
      `${BASE_URL}/api/salesman/mark/notification/read/${notificationId}`,
    GET_MY_COINS: `${BASE_URL}/api/salesman/get/my/coins`,
    GET_MY_COINS_SETTLEMENT_HISTORY: `${BASE_URL}/api/salesman/get/my/coinsettelment/history`,
    GET_CONVEYANCE: `${BASE_URL}/api/salesman/get/conveyance`,
  },
  DISTRIBUTOR: {
    CREATE_PICK_STOCK: `${BASE_URL}/api/salesman-distributor/create/pickstock`,
    APPROVE_PICK_STOCK: (pickStockId: string) => `${BASE_URL}/api/salesman-distributor/approve/pickstock/${pickStockId}`,
    GET_MY_PICK_STOCKS: `${BASE_URL}/api/salesman-distributor/get/pickstocks`,
    CREATE_RECONCILIATION: `${BASE_URL}/api/salesman-distributor/create/reconciliation`,
    GET_RECONCILIATIONS: (pickStockId: string) => `${BASE_URL}/api/salesman-distributor/get/reconciliations/${pickStockId}`,
    APPROVE_RECONCILIATION: (reconId: string) => `${BASE_URL}/api/salesman-distributor/approve/reconciliation/${reconId}`,
  },
  ACTIVITY: {
    START_LOG: `${BASE_URL}/api/salesman/start/activity/log`,
    END_LOG: (activityLogId: string) => `${BASE_URL}/api/salesman/end/activity/log/${activityLogId}`,
    GET_MY_ACTIVITY_LOGS: `${BASE_URL}/api/salesman/get/my/activity/logs`,
    GET_ACTIVITIES: `${BASE_URL}/api/salesman/get/activities`,
  },
  SUPERVISOR: {
    GET_MY_SALESMAN: `${BASE_URL}/api/salesman/supervisor/get/my/salesman`,
    GET_SALESMAN_STATS: (salesmanId: string) => `${BASE_URL}/api/salesman/supervisor/get/salesman/stats/${salesmanId}`,
  }
} as const;