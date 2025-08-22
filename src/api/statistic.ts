import api from "./axios";
import { ServerResponse, StatisticTotalResponse } from "./types";

export const fetchStatisticTotal =
  async (): Promise<StatisticTotalResponse> => {
    const response = await api.get<ServerResponse<StatisticTotalResponse>>(
      "/statistic/qrcode/user/total"
    );
    return response.data.data;
  };
