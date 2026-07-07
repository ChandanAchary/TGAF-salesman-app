import { z } from "zod";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginParams = z.infer<typeof loginInput>;

export const createUserInput = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().length(11, "Phone number must be 11 digits"),
  name: z.string().min(1),
  avatar: z.string().min(1).optional()
})

export type CreateUserParams = z.infer<typeof createUserInput>;

export const updateUserInput = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().length(11, "Phone number must be 11 digits").optional(),
  name: z.string().min(1).optional(),
  avatar: z.string().min(1).optional()
})

export type UpdateUserParams = z.infer<typeof updateUserInput>;

export const UpdateUserRoleAndHierarchy = z.object({
  roleId: z.string().optional(),
  hierarchyItemId: z.string().optional()
})

export type UpdateUserRoleAndHierarchyParams = z.infer<typeof UpdateUserRoleAndHierarchy>;

export const createRoleInput = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1)
})

export type CreateRoleParams = z.infer<typeof createRoleInput>;

export const createRolePermissionInput = z.object({
  tenantId: z.string().min(1),
  roleId: z.string().min(1),
  permissionIdArr: z.array(z.string().min(1))
})

export type CreateRolePermissionParams = z.infer<typeof createRolePermissionInput>;

export const createRoleWithPermissionInput = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  permissionIdArr: z.array(z.string().min(1))
})

export type CreateRoleWithPermissionParams = z.infer<typeof createRoleWithPermissionInput>;

export const createUserRolesInput = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  roleId: z.string().min(1)
});

export type CreateUserRolesParams = z.infer<typeof createUserRolesInput>;

export const createHierarchyLevelInput = z.object({
  tenantId: z.string().min(1),
  depth: z.number().min(1),
  name: z.string().min(1),
});

export type CreateHierarchyLevelParams = z.infer<typeof createHierarchyLevelInput>;

export const createHierarchyItemInput = z.object({
  tenantId: z.string().min(1),
  levelId: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().min(1).optional()
});

export type CreateHierarchyItemParams = z.infer<typeof createHierarchyItemInput>;

export const createHierarchyUserAssignmentInput = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  hierarchyItemId: z.string().min(1),
  roleId: z.string().min(1)
});

export type CreateHierarchyUserAssignmentParams = z.infer<typeof createHierarchyUserAssignmentInput>;

export const createHierarchyInput = z.object({
  tenantId: z.string().min(1),
  depth: z.number().min(1),
  levels: z.array(z.string().min(1))
});

export type CreateHierarchyParams = z.infer<typeof createHierarchyInput>;

export const createHierarchyItemsInput = z.object({
  tenantId: z.string().min(1),
  items: z.array(z.string().min(1))
});

export type CreateHierarchyItemsParams = z.infer<typeof createHierarchyItemsInput>;

export const signupSalesmanInput = z.object({
  tenantId: z.string().min(1),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().length(11, "Phone number must be 11 digits"),
  bank: z.string().min(1),
  bvnNumber: z.string().min(1),
  address: z.string().min(1),
  addressProof: z.string().min(1),
  avatar: z.string().min(1).optional(),
  hierarchyItemId: z.string().min(1),
  salesmanType: z.enum(["FIELDEXECUTIVE", "VANSALES", "SUPERVISOR", "CITYHEAD", "MERCHANDISER", "ASM", "OFFICE", "TERRITORY_SALES_MANAGER", "DRIVER"]),
})

export type SignupSalesmanParams = z.infer<typeof signupSalesmanInput>;

export const loginSalesmanInput = z.object({
  email: z.string().min(10),
  password: z.string().min(8),
  deviceId: z.string().min(1),
  osName: z.string().min(1),
  osVersion: z.string().min(1),
  manufacturer: z.string().min(1),
  modelName: z.string().min(1),
  appVersion: z.string().min(1),
  buildVersion: z.string().min(1)
})

export type LoginSalesmanParams = z.infer<typeof loginSalesmanInput>;

export const loginRefreshSalesmanInput = z.object({
  id: z.string().min(1),
  phone: z.string().min(1),
  refreshToken: z.string().min(1)
})

export type LoginRefreshSalesmanParams = z.infer<typeof loginRefreshSalesmanInput>;

export const signupDistributorInput = z.object({
  tenantId: z.string().min(1),
  password: z.string().min(8),
  email: z.string().email().optional(),
  name: z.string().min(1),
  phone: z.string().length(11, "Phone number must be 11 digits"),
  marketName: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().min(1),
  longitude: z.number().min(1),
  hierarchyItemId: z.string().min(1),
  avatar: z.string().min(1).optional(),
  bankAccountNumber: z.string().min(1),
  bankHolderName: z.string().min(1),
  currentAccountNumber: z.string().min(1),
  cseName: z.string().min(1),
  distributorCode: z.string().min(1),
  godowns: z.array(z.object({
    name: z.string().min(1).optional(),
    address: z.string().min(1),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    pincode: z.string().min(1).optional(),
  })),
  ownShops: z.array(z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    contactPerson: z.string().min(1),
    contactNumber: z.string().length(11, "Contact number must be 11 digits"),
  })),
  companiesDealt: z.array(z.object({
    companyName: z.string().min(1),
    dealingType: z.enum(["DISTRIBUTOR", "MEGA"]).optional(),
    productCategories: z.string().min(1).optional(),
  })),
  anniversaryDate: z.string().min(1).optional(),
  dateOfBirth: z.string().min(1).optional(),
})
export type SignupDistributorParams = z.infer<typeof signupDistributorInput>;

export const createDistributorSalesmanInput = z.object({
  tenantId: z.string().min(1),
  distributorId: z.string().min(1),
  salesmenIdArr: z.array(z.string().min(1))
})
export type CreateDistributorSalesmanParams = z.infer<typeof createDistributorSalesmanInput>;

export const checkInAttendenceInput = z.object({
  tenantId: z.string().min(1),
  salesmanId: z.string().min(1),
  checkInTime: z.string().min(1),
  startPoint: z.enum(["HOME", "MARKET"]),
  selfieUrl: z.string().min(1),
  oddometerUrl: z.string().min(1).optional(),
  oddometerReadingStart: z.number().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  activity: z.enum(["TASK_FORCE", "WORKING"]).default("WORKING")
})
export type CheckInAttendenceParams = z.infer<typeof checkInAttendenceInput>;

export const checkOutAttendenceInput = z.object({
  tenantId: z.string().min(1),
  salesmanId: z.string().min(1),
  checkOutTime: z.string().min(1),
  oddometerUrl: z.string().min(1).optional(),
  oddometerUrlEnd: z.string().min(1).optional(),
  oddometerReadingEnd: z.number().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})
export type CheckOutAttendenceParams = z.infer<typeof checkOutAttendenceInput>;

export const createBrandInput = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
})
export type CreateBrandParams = z.infer<typeof createBrandInput>;

export const createCategoryInput = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
})
export type CreateCategoryParams = z.infer<typeof createCategoryInput>;

export const createProductInput = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  productImg: z.string().min(1),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
})
export type CreateProductParams = z.infer<typeof createProductInput>;

export const createBatchInput = z.object({
  tenantId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().min(1),
  batchNumber: z.string().min(1)
})
export type CreateBatchParams = z.infer<typeof createBatchInput>;

export const createBatchPricesInput = z.object({
  tenantId: z.string().min(1),
  batchId: z.string().min(1),
  prices: z.array(z.object({
    customerTypeId: z.string().min(1),
    price: z.number().min(1)
  }))
})
export type CreateBatchPricesParams = z.infer<typeof createBatchPricesInput>;

export const createCustomerInput = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().length(11, "Phone number must be 11 digits"),
  customerTypeId: z.string().min(1),
  marketName: z.string().min(1),
  bvnNumber: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  hierarchyItemId: z.string().min(1),
  innerImageUrl: z.string().min(1).optional(),
  outerImageUrl: z.string().min(1).optional(),
})
export type CreateCustomerParams = z.infer<typeof createCustomerInput>;

export const approveCustomerInput = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
})
export type ApproveCustomerParams = z.infer<typeof approveCustomerInput>;

export const approveCustomersInput = z.object({
  tenantId: z.string().min(1),
  customerIds: z.array(z.string().min(1)),
})
export type ApproveCustomersParams = z.infer<typeof approveCustomersInput>;

export const createRouteInput = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  hierarchyItemId: z.string().min(1)
})
export type CreateRouteParams = z.infer<typeof createRouteInput>;

export const createRouteCustomerInput = z.object({
  tenantId: z.string().min(1),
  routeId: z.string().min(1),
  customerId: z.string().min(1)
})
export type CreateRouteCustomerParams = z.infer<typeof createRouteCustomerInput>;

export const assignCustomersToRouteInput = z.object({
  tenantId: z.string().min(1),
  routeId: z.string().min(1),
  customerIds: z.array(z.string().min(1))
})
export type AssignCustomersToRouteParams = z.infer<typeof assignCustomersToRouteInput>;

export const assignSalesmanToRouteInput = z.object({
  salesmanId: z.string().min(1),
  assignedRoutes: z.record(
    z.string().regex(/^\d+$/, "Key must be a day number"), // "1", "2", ...
    z.object({
      name: z.string().min(1),
      id: z.string().min(1),
      target: z.number().min(1),
    })
  )
})
export type AssignSalesmanToRouteParams = z.infer<typeof assignSalesmanToRouteInput>;

export const createOrderInput = z.object({
  customerId: z.string().min(1),
  orderItems: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number(),
    price: z.number().min(0),
  }))
})
export type CreateOrderParams = z.infer<typeof createOrderInput>;

export const loginDistributorInput = z.object({
  email: z.string().min(10),
  password: z.string().min(8)
})
export type LoginDistributorParams = z.infer<typeof loginDistributorInput>;

export const createAdminOrderInput = z.object({
  orderItems: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1)
  })).min(1, "At least one order item is required"),
  mega: z.object({
    address: z.string().min(1),
    name: z.string().min(1),
    phone: z.string().length(11, "Phone number must be 11 digits"),
  }).optional(),
})
export type CreateAdminOrderParams = z.infer<typeof createAdminOrderInput>;

export const createDistributorAdminOrderInput = z.object({
  orderItems: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1)
  })),
  distributorId: z.string().min(1),
  paymentProofUrls: z.array(z.string().min(1)),
  mega: z.object({
    address: z.string().min(1),
    name: z.string().min(1),
    phone: z.string().length(11, "Phone number must be 11 digits"),
  }).optional(),
})
export type CreateDistributorAdminOrderParams = z.infer<typeof createDistributorAdminOrderInput>;

export const approveAdminOrderInput = z.object({
  orderId: z.string().min(1),
})
export type ApproveAdminOrderParams = z.infer<typeof approveAdminOrderInput>;

export const updateAdminOrdersSchema = z.object({
  changes: z.array(
    z.object({
      id: z.string().min(1, "ID is required"),
      totalPrice: z.number().optional(),
      AdminOrderItems: z.array(
        z.object({
          id: z.string().min(1, "Item ID is required"),
          quantity: z.number().min(0, "Quantity must be non-negative"),
        })
      ).optional(),
    })
  ).min(1, "At least one change must be provided"),
});
export type UpdateAdminOrdersParams = z.infer<typeof updateAdminOrdersSchema>;

export const AssignDsitributorToSalesmanInput = z.object({
  tenantId: z.string().min(1),
  salesmanId: z.string().min(1),
  distributorIdArr: z.array(z.string().min(1))
})
export type AssignDistributorToSalesmanParams = z.infer<typeof AssignDsitributorToSalesmanInput>;

export const updateDistributorsSchema = z.object({
  changes: z.array(
    z.object({
      id: z.string().min(1, "ID is required"),
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      avatar: z.string().nullable().optional(),
      marketName: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      hierarchyItemId: z.string().optional(),
      cseName: z.string().optional(),
    })
  ).min(1, "At least one change must be provided"),
});
export type UpdateDistributorsParams = z.infer<typeof updateDistributorsSchema>;

export const updateSalesmenSchema = z.object({
  changes: z.array(
    z.object({
      id: z.string().min(1, "ID is required"),
      name: z.string().optional(),
      phone: z.string().optional(),
      bank: z.string().optional(),
      address: z.string().optional(),
      addressProof: z.string().optional(),
      avatar: z.string().nullable().optional(),
      salesmanType: z.enum(["FIELDEXECUTIVE", "VANSALES", "SUPERVISOR", "CITYHEAD", "MERCHANDISER", "ASM", "OFFICE", "TERRITORY_SALES_MANAGER", "DRIVER", "FACTORY"]).optional(),
      hierarchyItemId: z.string().optional(),
    })
  ).min(1, "At least one change must be provided"),
});
export type UpdateSalesmenParams = z.infer<typeof updateSalesmenSchema>;

export const updateCustomersSchema = z.object({
  changes: z.array(
    z.object({
      id: z.string().min(1, "ID is required"),
      name: z.string().optional(),
      phone: z.string().optional(),
      customerTypeId: z.string().optional(),
      marketName: z.string().optional(),
      bvnNumber: z.string().nullable().optional(),
      address: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      hierarchyItemId: z.string().optional(),
    })
  ).min(1, "At least one change must be provided"),
});
export type UpdateCustomersParams = z.infer<typeof updateCustomersSchema>;

export const updateRoutesSchema = z.object({
  changes: z.array(
    z.object({
      id: z.string().min(1, "ID is required"),
      name: z.string().optional(),
      hierarchyItemId: z.string().optional(),
      tenantId: z.string().optional(),
    })
  ).min(1, "At least one change must be provided"),
});
export type UpdateRoutesParams = z.infer<typeof updateRoutesSchema>;

export const arrpoveCustomerOrderInput = z.object({
  orderId: z.string().min(1),
})
export type ApproveCustomerOrderParams = z.infer<typeof arrpoveCustomerOrderInput>;

export const addToVisitedLoationInput = z.object({
  customerId: z.string().min(1),
  userLatitude: z.number(),
  userLongitude: z.number(),
})
export type AddToVisitedLocationParams = z.infer<typeof addToVisitedLoationInput>;

export const checkoutVisitedLocationInput = z.object({
  customerId: z.string().min(1),
  userLatitude: z.number(),
  userLongitude: z.number(),
})
export type CheckoutVisitedLocationParams = z.infer<typeof checkoutVisitedLocationInput>;

export const createCollectionHistorySchema = z.object({
  customerId: z.string().min(1),
  orderId: z.string().min(1),
  paid: z.number().min(1),
})
export type CreateCollectionHistoryParams = z.infer<typeof createCollectionHistorySchema>;

export const recieveInvoiceInput = z.object({
  invoiceId: z.string().min(1),
  items: z.array(z.object({
    id: z.string().min(1),
    recivedQuantity: z.number().min(1),
  }))
})
export type RecieveInvoiceParams = z.infer<typeof recieveInvoiceInput>;

export const updateClosingStockSchema = z.object({
  distributorId: z.string().min(1, "Distributor ID is required"),
  closingStock: z.record(
    z.string().min(1, "Product ID is required"),  // key: productId
    z.number().min(0, "Closing stock must be >= 0")  // value: closing
  ).refine((data) => Object.keys(data).length > 0, {
    message: "Closing stock cannot be empty",
  }),
});
export type UpdateClosingStockParams = z.infer<typeof updateClosingStockSchema>;

export const updateCustomerClosingStockSchema = z.object({
  customerId: z.string().min(1, "Distributor ID is required"),
  closingStock: z.record(
    z.string().min(1, "Product ID is required"),  // key: productId
    z.number().min(0, "Closing stock must be >= 0")  // value: closing
  ).refine((data) => Object.keys(data).length > 0, {
    message: "Closing stock cannot be empty",
  }),
});
export type UpdateCustomerClosingStockParams = z.infer<typeof updateCustomerClosingStockSchema>;

export const getOtpScheama = z.object({
  type: z.enum(["CUSTOMER", "DISTRIBUTOR", "SALESMAN"]),
  phone: z.string().length(11),
})
export type GetOtpParams = z.infer<typeof getOtpScheama>;

export const verifyOtpSchema = z.object({
  type: z.enum(["CUSTOMER", "DISTRIBUTOR", "SALESMAN"]),
  phone: z.string().length(11, "Phone number must be 11 digits"),
  otp: z.string().min(4),
})
export type VerifyOtpParams = z.infer<typeof verifyOtpSchema>;

export const InvoiceItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be greater than zero"),

  price: z.number().nonnegative("Price cannot be negative"),
});

export const CreateInvoiceSchema = z.object({
  orderId: z.string().min(1, "Order ID cannot be empty"),

  distributorId: z.string().min(1, "Distributor ID cannot be empty"),

  invoiceItems: z.record(z.string(), InvoiceItemSchema).refine(
    (val) => Object.keys(val).length > 0,
    { message: "At least one invoice item is required" }
  )
});
export type CreateInvoiceParams = z.infer<typeof CreateInvoiceSchema>;

export type salesmanType = "FIELDEXECUTIVE" | "VANSALES" | "SUPERVISOR" | "CITYHEAD" | "MERCHANDISER" | "ASM" | "OFFICE" | "TERRITORY_SALES_MANAGER" | "DRIVER" | "FACTORY";

export const editSalesmanSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  bank: z.string().optional(),
  address: z.string().optional(),
  addressProof: z.string().optional(),
  avatar: z.string().nullable().optional(),
})

export type EditSalesmanParams = z.infer<typeof editSalesmanSchema>;

export const applyForLeaveSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason for leave is required"),
  leaveType: z.enum(["SICK", "VACATION", "PERSONAL", "OTHER"]),
})

export type ApplyForLeaveParams = z.infer<typeof applyForLeaveSchema>;

export const createCustomerShelfHistorySchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  shelfUrl: z.string().min(1, "Shelf URL is required"),
})

export type CreateCustomerShelfHistoryParams = z.infer<typeof createCustomerShelfHistorySchema>;

export const loginAnalyticsInput = z.object({
  email: z.string().min(10),
  password: z.string().min(8)
})

export type LoginAnalyticsParams = z.infer<typeof loginAnalyticsInput>;

export const loginRefreshAnalyticsInput = z.object({
  email: z.string().min(1),
  refreshToken: z.string().min(1)
})

export type LoginRefreshAnalyticsParams = z.infer<typeof loginRefreshAnalyticsInput>;

export const approveSalesmanAttendanceInput = z.object({
  attendanceId: z.string().min(1, "Salesman ID is required")
})

export type ApproveSalesmanAttendanceParams = z.infer<typeof approveSalesmanAttendanceInput>;


export const updateDistirbutorDetailsSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().nullable().optional(),
  marketName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bankAccountNumber: z.string().optional(),
  bankHolderName: z.string().optional(),
  currentAccountNumber: z.string().optional(),
  distributorCode: z.string().optional(),
  anniversaryDate: z.string().min(1).optional(),
  dateOfBirth: z.string().min(1).optional(),
  coi: z.string().optional(),
  cseName: z.string().optional(),
  Godown: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    address: z.string().min(1),
    city: z.string().optional(),
    state: z.string().optional(),
    pinCode: z.string().optional(),
  })).optional(),

  OwnShop: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    address: z.string().min(1),
    contactPerson: z.string().min(1),
    phone: z.string().length(11, "Phone number must be 11 digits"),
  })).optional(),

  CompanyDelt: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    dealingType: z.enum(["DISTRIBUTOR", "MEGA"]).optional(),
    productCategory: z.string().optional(),
  })).optional(),
})

export type UpdateDistirbutorDetailsParams = z.infer<typeof updateDistirbutorDetailsSchema>;

export const approveSalesmanLeaveInput = z.object({
  leaveId: z.string().min(1, "Leave ID is required")
})

export type ApproveSalesmanLeaveParams = z.infer<typeof approveSalesmanLeaveInput>;

export const rejectSalesmanLeaveInput = z.object({
  leaveId: z.string().min(1, "Leave ID is required"),
  comment: z.string().optional(),
})

export type RejectSalesmanLeaveParams = z.infer<typeof rejectSalesmanLeaveInput>;

export const approveLoginRequestInput = z.object({
  requestId: z.string().min(1, "Request ID is required")
});

export type ApproveLoginRequestParams = z.infer<typeof approveLoginRequestInput>;

export const salesmanSettlementInput = z.object({
  salesmanId: z.string().min(1, "Salesman ID is required"),
  paidAmt: z.number().min(0, "Paid amount must be a non-negative number"),
});

export type SalesmanSettlementParams = z.infer<typeof salesmanSettlementInput>;

export const createNotificationSchema = z.object({
  salesmanIds: z.array(z.string().min(1, "Salesman ID is required")),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
})

export type CreateNotificationParams = z.infer<typeof createNotificationSchema>;

export const updateRolePermissionsInput = z.object({
  roleId: z.string().min(1),
  permissionIdArr: z.array(z.string().min(1))
})

export type UpdateRolePermissionsParams = z.infer<typeof updateRolePermissionsInput>;