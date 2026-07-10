import { FilterType, DashboardData, AnalyticsParams } from "../types/analytics";
import { formatPrice } from "../formatters/formatter";

// Helper to simulate network lag
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  async getDashboardData(
    role: "CITYHEAD" | "FIELDEXECUTIVE",
    params: AnalyticsParams
  ): Promise<DashboardData> {
    await delay(1200); // 1.2s delay to test loading skeletons

    const { filterType } = params;

    // Standard multipliers based on date ranges (distinguished to show exact data differences)
    let mult = 1;
    let periodLabel = "this Month";
    switch (filterType) {
      case "TODAY":
        mult = 0.04;
        periodLabel = "vs Yesterday";
        break;
      case "YESTERDAY":
        mult = 0.045;
        periodLabel = "vs Day Before";
        break;
      case "THIS_WEEK":
        mult = 0.22;
        periodLabel = "vs Last Week";
        break;
      case "LAST_WEEK":
        mult = 0.26;
        periodLabel = "vs Week Before";
        break;
      case "THIS_MONTH":
        mult = 1.0;
        periodLabel = "vs Last Month";
        break;
      case "LAST_MONTH":
        mult = 1.12;
        periodLabel = "vs Month Before";
        break;
      case "LAST_3_MONTHS":
        mult = 3.1;
        periodLabel = "vs Prev Quarter";
        break;
      case "THIS_YEAR":
        mult = 12.4;
        periodLabel = "vs Last Year";
        break;
      case "CUSTOM":
        mult = 0.5;
        periodLabel = "vs Custom Range";
        break;
    }

    // Apply dynamic hierarchy metrics scale factor to simulate geographic sub-distribution
    let hierarchyMult = 1.0;
    if (params.branch && params.branch !== "All Branches") {
      hierarchyMult *= 0.5;
    }
    if (params.area && params.area !== "All Areas") {
      hierarchyMult *= 0.25;
    }
    if (params.market && params.market !== "All Markets") {
      hierarchyMult *= 0.3;
    }
    mult = mult * hierarchyMult;

    if (role === "CITYHEAD") {
      const areasList = ["Ikeja Area", "Lekki Area", "Surulere Area", "Yaba Area", "Victoria Island Area"];
      const marketsList = ["Computer Village", "Ikeja Main Market", "Oregun Market", "Main Market"];
      const firstNames = [
        "Chinedu", "Fatima", "Tunde", "Amara", "Ibrahim", "Adaeze", "Kunle", "Bisi", "Emeka", "Kemi",
        "Olumide", "Yetunde", "Babajide", "Ngozi", "Oluwaseun", "Chioma", "Femi", "Folake", "Jide", "Sade",
        "Kofi", "Abidemi", "Chidi", "Funmilayo", "Gboyega", "Halima", "Jimi", "Kehinde", "Lekan", "Ronke"
      ];
      const lastNames = [
        "Alao", "Bello", "Oshin", "Nwachukwu", "Kazeem", "Obi", "Adeyemi", "Ajayi", "Okonkwo", "Balogun",
        "Bakare", "Olawale", "Kolawole", "Eze", "Salami", "Opara", "Ojo", "Adedayo", "Fagbemi", "Adeniran",
        "Mensah", "Adesina", "Okafor", "Adebayo", "Dada", "Yusuf", "Sowande", "Oloyede", "Babalola", "Alabi"
      ];

      const generatedTeam = Array.from({ length: 30 }, (_, idx) => {
        const firstName = firstNames[idx % firstNames.length];
        const lastName = lastNames[idx % lastNames.length];
        const name = `${firstName} ${lastName}`;
        const roleName = idx < 5 ? "Supervisor" : "Field Executive";
        const area = areasList[idx % areasList.length];
        const market = marketsList[(idx + idx % 3) % marketsList.length];
        
        let status: "Present" | "Late" | "Leave" | "Absent" = "Present";
        if (idx === 2 || idx === 12) status = "Late";
        if (idx === 8 || idx === 18) status = "Leave";
        if (idx === 28) status = "Absent";

        return {
          id: String(idx + 1),
          name,
          role: roleName,
          avatar: `https://api.dicebear.com/7.x/adventurer/png?seed=${firstName}`,
          sales: Math.round((2100000 - idx * 40000) * mult),
          collection: Math.round((1800000 - idx * 35000) * mult),
          orders: Math.round((62 - idx % 30) * mult),
          visits: Math.round((45 - idx * 0.5) * mult),
          attendance: idx % 3 === 0 ? 98 : idx % 3 === 1 ? 95 : 92,
          targetAchievement: idx % 2 === 0 ? Math.max(50, 95 - idx) : Math.max(50, 92 - idx),
          performance: 96 - idx,
          rank: idx + 1,
          status,
          area,
          market
        };
      });

      return {
        summary: {
          sales: {
            value: formatPrice(Math.round(15450000 * mult)),
            growth: 14.8,
            trend: "up",
          },
          collection: {
            value: formatPrice(Math.round(11200000 * mult)),
            growth: 8.2,
            trend: "up",
          },
          outstanding: {
            value: formatPrice(Math.round(4250000 * mult)),
            growth: -5.4,
            trend: "down", // Outstanding going down is good!
          },
          ordersCreated: {
            value: Math.round(412 * mult),
            growth: 12.3,
            trend: "up",
          },
          ordersDelivered: {
            value: Math.round(380 * mult),
            growth: 14.1,
            trend: "up",
          },
          retailersVisited: {
            value: Math.round(284 * mult),
            growth: 6.5,
            trend: "up",
          },
          workingEmployees: {
            value: 28,
            growth: 0,
            trend: "flat",
          },
          attendancePercent: {
            value: "94.5%",
            growth: 1.8,
            trend: "up",
          },
          activeCustomers: {
            value: Math.round(942 * (0.8 + mult * 0.1)),
            growth: 3.2,
            trend: "up",
          },
          newCustomers: {
            value: Math.round(48 * mult),
            growth: 18.4,
            trend: "up",
          },
          pendingCollections: {
            value: formatPrice(Math.round(1450000 * mult)),
            growth: -12.3,
            trend: "down",
          },
          targetAchievement: {
            value: "86.2%",
            growth: 2.5,
            trend: "up",
          },
          averageOrderValue: {
            value: "₦37,500",
            growth: 4.1,
            trend: "up",
          },
          averageCollection: {
            value: "₦400,000",
            growth: 3.0,
            trend: "up",
          },
        },
        charts: {
          salesTrend: [
            { label: "Jan", value: Math.round(9200000 * mult) },
            { label: "Feb", value: Math.round(10800000 * mult) },
            { label: "Mar", value: Math.round(11500000 * mult) },
            { label: "Apr", value: Math.round(13400000 * mult) },
            { label: "May", value: Math.round(14500000 * mult) },
            { label: "Jun", value: Math.round(15450000 * mult) },
          ],
          collectionTrend: [
            { label: "Jan", value: Math.round(7100000 * mult) },
            { label: "Feb", value: Math.round(8500000 * mult) },
            { label: "Mar", value: Math.round(9000000 * mult) },
            { label: "Apr", value: Math.round(10200000 * mult) },
            { label: "May", value: Math.round(10800000 * mult) },
            { label: "Jun", value: Math.round(11200000 * mult) },
          ],
          orderTrend: [
            { label: "Jan", value: Math.round(290 * mult) },
            { label: "Feb", value: Math.round(310 * mult) },
            { label: "Mar", value: Math.round(340 * mult) },
            { label: "Apr", value: Math.round(370 * mult) },
            { label: "May", value: Math.round(390 * mult) },
            { label: "Jun", value: Math.round(412 * mult) },
          ],
          salesByArea: [
            { label: "Ikeja", value: Math.round(4500000 * mult) },
            { label: "Lekki", value: Math.round(3800000 * mult) },
            { label: "Surulere", value: Math.round(2900000 * mult) },
            { label: "Yaba", value: Math.round(2450000 * mult) },
            { label: "Victoria Island", value: Math.round(1800000 * mult) },
          ],
          salesBySalesman: [
            { label: "Chinedu A.", value: Math.round(2100000 * mult) },
            { label: "Fatima B.", value: Math.round(1850000 * mult) },
            { label: "Tunde O.", value: Math.round(1600000 * mult) },
            { label: "Amara N.", value: Math.round(1450000 * mult) },
            { label: "Ibrahim K.", value: Math.round(1300000 * mult) },
          ],
        },
        team: generatedTeam,
        products: [
          {
            id: "p1",
            name: "Premium Lager Beer 450ml",
            sku: "SKU-PLB450",
            quantity: Math.round(4500 * mult),
            revenue: Math.round(2250000 * mult),
            status: "top",
          },
          {
            id: "p2",
            name: "Classic Stout Can 330ml",
            sku: "SKU-CSC330",
            quantity: Math.round(3200 * mult),
            revenue: Math.round(1760000 * mult),
            status: "top",
          },
          {
            id: "p3",
            name: "Diet Lemon Cider 500ml",
            sku: "SKU-DLC500",
            quantity: Math.round(2800 * mult),
            revenue: Math.round(1120000 * mult),
            status: "top",
          },
          {
            id: "p6",
            name: "Fruit Juice Premium 1L",
            sku: "SKU-FJP1000",
            quantity: Math.round(2400 * mult),
            revenue: Math.round(960000 * mult),
            status: "top",
          },
          {
            id: "p7",
            name: "Energy Drink Can 250ml",
            sku: "SKU-EDC250",
            quantity: Math.round(2100 * mult),
            revenue: Math.round(840000 * mult),
            status: "top",
          },
          {
            id: "p8",
            name: "Tonic Water Bottle 500ml",
            sku: "SKU-TWB500",
            quantity: Math.round(1800 * mult),
            revenue: Math.round(540000 * mult),
            status: "top",
          },
          {
            id: "p4",
            name: "Ginger Soda Bottle 250ml",
            sku: "SKU-GSB250",
            quantity: Math.round(120 * mult),
            revenue: Math.round(48000 * mult),
            status: "slow",
          },
          {
            id: "p5",
            name: "Zero Malt Can 330ml",
            sku: "SKU-ZMC330",
            quantity: Math.round(95 * mult),
            revenue: Math.round(33250 * mult),
            status: "slow",
          },
          {
            id: "p9",
            name: "Pineapple Punch Can 330ml",
            sku: "SKU-PPC330",
            quantity: Math.round(80 * mult),
            revenue: Math.round(28000 * mult),
            status: "slow",
          },
          {
            id: "p10",
            name: "Bitter Lemon Bottle 350ml",
            sku: "SKU-BLB350",
            quantity: Math.round(60 * mult),
            revenue: Math.round(18000 * mult),
            status: "slow",
          },
        ],
        areas: [
          {
            id: "a1",
            name: "Ikeja Sector A",
            sales: Math.round(4500000 * mult),
            collection: Math.round(3800000 * mult),
            orders: Math.round(110 * mult),
            outstanding: Math.round(700000 * mult),
            growth: 15.2,
            rank: 1,
          },
          {
            id: "a2",
            name: "Lekki Phase 1",
            sales: Math.round(3800000 * mult),
            collection: Math.round(3100000 * mult),
            orders: Math.round(95 * mult),
            outstanding: Math.round(700000 * mult),
            growth: 12.4,
            rank: 2,
          },
          {
            id: "a3",
            name: "Surulere Main Route",
            sales: Math.round(2900000 * mult),
            collection: Math.round(2300000 * mult),
            orders: Math.round(80 * mult),
            outstanding: Math.round(600000 * mult),
            growth: 9.1,
            rank: 3,
          },
        ],
        distributors: [
          {
            id: "d1",
            name: "Alaba Mega Distributor Ltd",
            sales: Math.round(6200000 * mult),
            outstanding: Math.round(1200000 * mult),
            balance: Math.round(5000000 * mult),
            status: "active",
          },
          {
            id: "d2",
            name: "Epe Regional Warehouse",
            sales: Math.round(4800000 * mult),
            outstanding: Math.round(2400000 * mult),
            balance: Math.round(2400000 * mult),
            status: "critical", // high outstanding credit
          },
        ],
        alerts: [
          {
            id: "al1",
            type: "danger",
            message: "Supervisor Ibrahim Kazeem is absent today without leave log.",
            timestamp: "08:30 AM",
          },
          {
            id: "al2",
            type: "warning",
            message: "Epe Regional Warehouse exceeds credit limits by ₦400,000.",
            timestamp: "10:15 AM",
          },
          {
            id: "al3",
            type: "info",
            message: "Lekki Phase 1 route achieved 100% target sales volume for this week.",
            timestamp: "12:00 PM",
          },
        ],
      };
    } else {
      // FIELDEXECUTIVE specific metrics
      const areasList = ["Ikeja Area", "Lekki Area", "Surulere Area"];
      const marketsList = ["Computer Village", "Ikeja Main Market", "Oregun Market", "Main Market"];
      const firstNames = ["Chinedu", "Tunde", "Amara", "Adaeze", "Kunle", "Bisi"];
      const lastNames = ["Alao", "Oshin", "Nwachukwu", "Obi", "Adeyemi", "Ajayi"];

      const generatedExecutiveTeam = Array.from({ length: 6 }, (_, idx) => {
        const firstName = firstNames[idx];
        const lastName = lastNames[idx];
        const name = `${firstName} ${lastName}`;
        const area = areasList[idx % areasList.length];
        const market = marketsList[(idx + idx % 3) % marketsList.length];

        return {
          id: String(idx + 1),
          name,
          role: "Field Executive",
          avatar: `https://api.dicebear.com/7.x/adventurer/png?seed=${firstName}`,
          sales: Math.round((1200000 - idx * 100000) * mult),
          collection: Math.round((950000 - idx * 80000) * mult),
          orders: Math.round((35 - idx * 3) * mult),
          visits: Math.round((28 - idx * 2) * mult),
          attendance: idx % 2 === 0 ? 98 : 95,
          targetAchievement: 96 - idx * 2,
          performance: 97 - idx * 2,
          rank: idx + 1,
          status: (idx === 1 || idx === 4 ? "Late" : "Present") as any,
          area,
          market
        };
      });

      return {
        summary: {
          sales: {
            value: formatPrice(Math.round(2850000 * mult)),
            growth: 10.2,
            trend: "up",
          },
          collection: {
            value: formatPrice(Math.round(2100000 * mult)),
            growth: 5.4,
            trend: "up",
          },
          outstanding: {
            value: formatPrice(Math.round(750000 * mult)),
            growth: 12.0,
            trend: "up", // growing outstanding collections is bad!
          },
          ordersCreated: {
            value: Math.round(84 * mult),
            growth: 8.5,
            trend: "up",
          },
          ordersDelivered: {
            value: Math.round(72 * mult),
            growth: 9.2,
            trend: "up",
          },
          retailersVisited: {
            value: Math.round(62 * mult),
            growth: 4.1,
            trend: "up",
          },
          workingEmployees: {
            value: 6, // team size
            growth: 0,
            trend: "flat",
          },
          attendancePercent: {
            value: "95.8%",
            growth: 1.2,
            trend: "up",
          },
          activeCustomers: {
            value: Math.round(180 * (0.85 + mult * 0.05)),
            growth: 2.1,
            trend: "up",
          },
          newCustomers: {
            value: Math.round(8 * mult),
            growth: 14.3,
            trend: "up",
          },
          pendingCollections: {
            value: formatPrice(Math.round(2400000 * mult)),
            growth: 5.0,
            trend: "up",
          },
          targetAchievement: {
            value: "91.5%",
            growth: 3.1,
            trend: "up",
          },
          averageOrderValue: {
            value: "₦33,900",
            growth: 2.5,
            trend: "up",
          },
          averageCollection: {
            value: "₦85,000",
            growth: 1.1,
            trend: "up",
          },
        },
        charts: {
          salesTrend: [
            { label: "Jan", value: Math.round(1800000 * mult) },
            { label: "Feb", value: Math.round(2100000 * mult) },
            { label: "Mar", value: Math.round(2250000 * mult) },
            { label: "Apr", value: Math.round(2500000 * mult) },
            { label: "May", value: Math.round(2700000 * mult) },
            { label: "Jun", value: Math.round(2850000 * mult) },
          ],
          collectionTrend: [
            { label: "Jan", value: Math.round(1400000 * mult) },
            { label: "Feb", value: Math.round(1650000 * mult) },
            { label: "Mar", value: Math.round(1750000 * mult) },
            { label: "Apr", value: Math.round(1900000 * mult) },
            { label: "May", value: Math.round(2000000 * mult) },
            { label: "Jun", value: Math.round(2100000 * mult) },
          ],
          orderTrend: [
            { label: "Jan", value: Math.round(55 * mult) },
            { label: "Feb", value: Math.round(62 * mult) },
            { label: "Mar", value: Math.round(68 * mult) },
            { label: "Apr", value: Math.round(75 * mult) },
            { label: "May", value: Math.round(80 * mult) },
            { label: "Jun", value: Math.round(84 * mult) },
          ],
          salesByArea: [
            { label: "Ikeja Main", value: Math.round(1400000 * mult) },
            { label: "Allen Avenue", value: Math.round(850000 * mult) },
            { label: "Computer Village", value: Math.round(600000 * mult) },
          ],
          salesBySalesman: [
            { label: "Chinedu A.", value: Math.round(1200000 * mult) },
            { label: "Tunde O.", value: Math.round(950000 * mult) },
            { label: "Amara N.", value: Math.round(700000 * mult) },
          ],
        },
        team: generatedExecutiveTeam,
        products: [
          {
            id: "p1",
            name: "Premium Lager Beer 450ml",
            sku: "SKU-PLB450",
            quantity: Math.round(950 * mult),
            revenue: Math.round(475000 * mult),
            status: "top",
          },
          {
            id: "p2",
            name: "Classic Stout Can 330ml",
            sku: "SKU-CSC330",
            quantity: Math.round(620 * mult),
            revenue: Math.round(341000 * mult),
            status: "top",
          },
          {
            id: "p3",
            name: "Diet Lemon Cider 500ml",
            sku: "SKU-DLC500",
            quantity: Math.round(550 * mult),
            revenue: Math.round(220000 * mult),
            status: "top",
          },
          {
            id: "p6",
            name: "Fruit Juice Premium 1L",
            sku: "SKU-FJP1000",
            quantity: Math.round(480 * mult),
            revenue: Math.round(192000 * mult),
            status: "top",
          },
          {
            id: "p7",
            name: "Energy Drink Can 250ml",
            sku: "SKU-EDC250",
            quantity: Math.round(400 * mult),
            revenue: Math.round(160000 * mult),
            status: "top",
          },
          {
            id: "p4",
            name: "Ginger Soda Bottle 250ml",
            sku: "SKU-GSB250",
            quantity: Math.round(15 * mult),
            revenue: Math.round(6000 * mult),
            status: "slow",
          },
          {
            id: "p5",
            name: "Zero Malt Can 330ml",
            sku: "SKU-ZMC330",
            quantity: Math.round(12 * mult),
            revenue: Math.round(4200 * mult),
            status: "slow",
          },
          {
            id: "p9",
            name: "Pineapple Punch Can 330ml",
            sku: "SKU-PPC330",
            quantity: Math.round(8 * mult),
            revenue: Math.round(2800 * mult),
            status: "slow",
          },
          {
            id: "p10",
            name: "Bitter Lemon Bottle 350ml",
            sku: "SKU-BLB350",
            quantity: Math.round(5 * mult),
            revenue: Math.round(1500 * mult),
            status: "slow",
          },
        ],
        areas: [
          {
            id: "a1",
            name: "Ikeja Main",
            sales: Math.round(1400000 * mult),
            collection: Math.round(1100000 * mult),
            orders: Math.round(45 * mult),
            outstanding: Math.round(300000 * mult),
            growth: 11.2,
            rank: 1,
          },
          {
            id: "a2",
            name: "Allen Avenue",
            sales: Math.round(850000 * mult),
            collection: Math.round(650000 * mult),
            orders: Math.round(25 * mult),
            outstanding: Math.round(200000 * mult),
            growth: 8.4,
            rank: 2,
          },
        ],
        distributors: [],
        alerts: [
          {
            id: "fe1",
            type: "warning",
            message: "Tunde Oshin has 2 missed visits on Allen Avenue route.",
            timestamp: "09:30 AM",
          },
          {
            id: "fe2",
            type: "info",
            message: "Daily team sales target achieved to 90% by noon.",
            timestamp: "12:15 PM",
          },
        ],
      };
    }
  },
};
