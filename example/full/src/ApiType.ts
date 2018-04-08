/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface UserFilter {
  username?: string | null,
  rules?: Array< number | null > | null,
  language?: Array< number | null > | null,
  dateFrom?: string | null,
  dateTo?: string | null,
  email?: string | null,
};

export interface UserOrder {
  name: UserOrderEnum,
  type: OrderEnum,
};

export enum UserOrderEnum {
  date = "date",
  email = "email",
  language = "language",
  username = "username",
}


export enum OrderEnum {
  asc = "asc",
  desc = "desc",
}


export interface ExchangeFilter {
  total_volume_24h_to_b_eq?: number | null,
  total_volume_24h_to_l_eq?: number | null,
  total_volume_24h_to_b?: number | null,
  total_volume_24h_to_l?: number | null,
  total_volume_24h_b_eq?: number | null,
  total_volume_24h_l_eq?: number | null,
  total_volume_24h_b?: number | null,
  total_volume_24h_l?: number | null,
  market_cap_b_eq?: number | null,
  market_cap_l_eq?: number | null,
  market_cap_b?: number | null,
  market_cap_l?: number | null,
  supply_b_eq?: number | null,
  supply_l_eq?: number | null,
  supply_b?: number | null,
  supply_l?: number | null,
  change_pct_day_b_eq?: number | null,
  change_pct_day_l_eq?: number | null,
  change_pct_day_b?: number | null,
  change_pct_day_l?: number | null,
  change_day_b_eq?: number | null,
  change_day_l_eq?: number | null,
  change_day_b?: number | null,
  change_day_l?: number | null,
  change_pct_24h_b_eq?: number | null,
  change_pct_24h_l_eq?: number | null,
  change_pct_24h_b?: number | null,
  change_pct_24h_l?: number | null,
  change_24h_b_eq?: number | null,
  change_24h_l_eq?: number | null,
  change_24h_b?: number | null,
  change_24h_l?: number | null,
  open_24h_b_eq?: number | null,
  open_24h_l_eq?: number | null,
  open_24h_b?: number | null,
  open_24h_l?: number | null,
  low_day_b_eq?: number | null,
  low_day_l_eq?: number | null,
  low_day_b?: number | null,
  low_day_l?: number | null,
  high_day_b_eq?: number | null,
  high_day_l_eq?: number | null,
  high_day_b?: number | null,
  high_day_l?: number | null,
  open_day_b_eq?: number | null,
  open_day_l_eq?: number | null,
  open_day_b?: number | null,
  open_day_l?: number | null,
  volume_24h_to_b_eq?: number | null,
  volume_24h_to_l_eq?: number | null,
  volume_24h_to_b?: number | null,
  volume_24h_to_l?: number | null,
  volume_24h_b_eq?: number | null,
  volume_24h_l_eq?: number | null,
  volume_24h_b?: number | null,
  volume_24h_l?: number | null,
  volume_day_to_b_eq?: number | null,
  volume_day_to_l_eq?: number | null,
  volume_day_to_b?: number | null,
  volume_day_to_l?: number | null,
  volume_day_b_eq?: number | null,
  volume_day_l_eq?: number | null,
  volume_day_b?: number | null,
  volume_day_l?: number | null,
  last_volume_to_b_eq?: number | null,
  last_volume_to_l_eq?: number | null,
  last_volume_to_b?: number | null,
  last_volume_to_l?: number | null,
  last_volume_b_eq?: number | null,
  last_volume_l_eq?: number | null,
  last_volume_b?: number | null,
  last_volume_l?: number | null,
  price_b_eq?: number | null,
  price_l_eq?: number | null,
  price_b?: number | null,
  price_l?: number | null,
  symbol_from_cc_ids?: Array< string | null > | null,
  symbol_to_cc_ids?: Array< string | null > | null,
  market_cc_ids?: Array< string | null > | null,
  cc_id_from?: string | null,
  cc_id_to?: string | null,
  cc_id_market?: string | null,
  active?: boolean | null,
};

export interface ExchangeOrder {
  name: ExchangeOrderEnum,
  type: OrderEnum,
};

export enum ExchangeOrderEnum {
  active = "active",
  change_24h = "change_24h",
  change_day = "change_day",
  change_pct_24h = "change_pct_24h",
  change_pct_day = "change_pct_day",
  date = "date",
  high_day = "high_day",
  last_update = "last_update",
  last_update_timestamp = "last_update_timestamp",
  last_volume = "last_volume",
  last_volume_to = "last_volume_to",
  low_day = "low_day",
  market_cap = "market_cap",
  market_cc_id = "market_cc_id",
  open_24h = "open_24h",
  open_day = "open_day",
  price = "price",
  supply = "supply",
  symbol_from_cc_id = "symbol_from_cc_id",
  symbol_to_cc_id = "symbol_to_cc_id",
  total_volume_24h = "total_volume_24h",
  total_volume_24h_to = "total_volume_24h_to",
  volume_24h = "volume_24h",
  volume_24h_to = "volume_24h_to",
  volume_day = "volume_day",
  volume_day_to = "volume_day_to",
}


export interface MarketFilter {
  name?: string | null,
};

export interface MarketOrder {
  name: MarketOrderEnum,
  type: OrderEnum,
};

export enum MarketOrderEnum {
  name = "name",
}


export interface SymbolFilter {
  name?: string | null,
};

export interface SymbolOrder {
  name: SymbolOrderEnum,
  type: OrderEnum,
};

export enum SymbolOrderEnum {
  name = "name",
}


export interface FeedbackFilter {
  users?: Array< string | null > | null,
};

export interface FeedbackOrder {
  name: FeedbackOrderEnum,
  type: OrderEnum,
};

export enum FeedbackOrderEnum {
  date = "date",
  last_message_date = "last_message_date",
}


export interface FeedbackMessageFilter {
  value?: string | null,
};

export interface UsersDeleteMutationVariables {
  ids: Array< string >,
};

export interface UsersDeleteMutation {
  user:  {
    delete: boolean | null,
  } | null,
};

export interface UserEditMeMutationVariables {
  username: string,
  password?: string | null,
  email?: string | null,
  avatar?: string | null,
  language?: string | null,
};

export interface UserEditMeMutation {
  user:  {
    editMe:  {
      id: string | null,
      avatar: string | null,
      username: string | null,
      email: string | null,
      rules: Array< string | null > | null,
      language: string | null,
    } | null,
  } | null,
};

export interface UsersQueryVariables {
  filter: UserFilter,
  order?: Array< UserOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface UsersQuery {
  user:  {
    list:  {
      users:  Array< {
        id: string | null,
        username: string | null,
        rules: Array< string | null > | null,
        email: string | null,
        language: string | null,
        avatar: string | null,
      } | null > | null,
      count: number | null,
    } | null,
  } | null,
};

export interface UsersListQueryVariables {
  filter: UserFilter,
  order?: Array< UserOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface UsersListQuery {
  user:  {
    list:  {
      users:  Array< {
        id: string | null,
        username: string | null,
        avatar: string | null,
      } | null > | null,
    } | null,
  } | null,
};

export interface AuthMutationVariables {
  login?: string | null,
  password: string,
};

export interface AuthMutation {
  auth:  {
    login:  {
      sid: string | null,
      token: string | null,
      user:  {
        id: string | null,
        username: string | null,
        email: string | null,
        avatar: string | null,
        rules: Array< string | null > | null,
      } | null,
    } | null,
  } | null,
};

export interface UserMeQuery {
  user:  {
    me:  {
      id: string | null,
      avatar: string | null,
      username: string | null,
      email: string | null,
      rules: Array< string | null > | null,
      language: string | null,
    } | null,
  } | null,
};

export interface RegistrationMutationVariables {
  username: string,
  password: string,
  email?: string | null,
  avatar?: string | null,
};

export interface RegistrationMutation {
  auth:  {
    registration:  {
      id: string | null,
    } | null,
  } | null,
};

export interface TouchMutation {
  auth:  {
    touch:  {
      sid: string | null,
      token: string | null,
      user:  {
        id: string | null,
        username: string | null,
        email: string | null,
        avatar: string | null,
        rules: Array< string | null > | null,
      } | null,
    } | null,
  } | null,
};

export interface ExchangesListQueryVariables {
  filter: ExchangeFilter,
  order?: Array< ExchangeOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface ExchangesListQuery {
  exchange:  {
    list:  {
      exchanges:  Array< {
        id: string | null,
        symbol_from:  {
          id: string | null,
          cc_id: string | null,
          img: string | null,
          name: string | null,
          full_name: string | null,
        } | null,
        symbol_to:  {
          id: string | null,
          cc_id: string | null,
          img: string | null,
          name: string | null,
          full_name: string | null,
        } | null,
        market:  {
          id: string | null,
          cc_id: string | null,
          name: string | null,
          last_sync_date: string | null,
        } | null,
        active: boolean | null,
        last_update_timestamp: number | null,
        last_update: string | null,
        price: number | null,
        price_label: string | null,
        last_volume: number | null,
        last_volume_label: string | null,
        last_volume_to: number | null,
        last_volume_to_label: string | null,
        volume_day: number | null,
        volume_day_label: string | null,
        volume_day_to: number | null,
        volume_day_to_label: string | null,
        volume_24h: number | null,
        volume_24h_label: string | null,
        volume_24h_to_label: string | null,
        open_day: number | null,
        open_day_label: string | null,
        high_day: number | null,
        high_day_label: string | null,
        low_day: number | null,
        low_day_label: string | null,
        open_24h: number | null,
        open_24h_label: string | null,
        change_24h: number | null,
        change_24h_label: string | null,
        change_pct_24h: number | null,
        change_pct_24h_label: string | null,
        change_day: number | null,
        change_day_label: string | null,
        change_pct_day: number | null,
        change_pct_day_label: string | null,
        supply: number | null,
        supply_label: string | null,
        market_cap: number | null,
        market_cap_label: string | null,
        total_volume_24h: number | null,
        total_volume_24h_label: string | null,
        total_volume_24h_to: number | null,
        total_volume_24h_to_label: string | null,
        relative_volume: number | null,
        volatility: number | null,
      } | null > | null,
      count: number | null,
    } | null,
  } | null,
};

export interface MarketFindOneQueryVariables {
  cc_id?: string | null,
};

export interface MarketFindOneQuery {
  market:  {
    findOne:  {
      id: string | null,
      cc_id: string | null,
      name: string | null,
      last_sync_date: string | null,
    } | null,
  } | null,
};

export interface MarketsListQueryVariables {
  filter: MarketFilter,
  order?: Array< MarketOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface MarketsListQuery {
  market:  {
    list:  {
      markets:  Array< {
        id: string | null,
        cc_id: string | null,
        name: string | null,
        last_sync_date: string | null,
      } | null > | null,
      count: number | null,
    } | null,
  } | null,
};

export interface SymbolFindOneQueryVariables {
  cc_id?: string | null,
};

export interface SymbolFindOneQuery {
  symbol:  {
    findOne:  {
      id: string | null,
      cc_id: string | null,
      img: string | null,
      name: string | null,
      full_name: string | null,
    } | null,
  } | null,
};

export interface SymbolsListQueryVariables {
  filter: SymbolFilter,
  order?: Array< SymbolOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface SymbolsListQuery {
  symbol:  {
    list:  {
      symbols:  Array< {
        id: string | null,
        cc_id: string | null,
        img: string | null,
        name: string | null,
        full_name: string | null,
      } | null > | null,
      count: number | null,
    } | null,
  } | null,
};

export interface CreateFeedbackMutationVariables {
  text: string,
};

export interface CreateFeedbackMutation {
  feedback:  {
    create_feedback:  {
      id: string | null,
    } | null,
  } | null,
};

export interface CreateFeedbackMessageMutationVariables {
  id: string,
  text: string,
};

export interface CreateFeedbackMessageMutation {
  feedback:  {
    get:  {
      create_message:  {
        id: string | null,
        value: string | null,
      } | null,
    } | null,
  } | null,
};

export interface DeleteFeedbackMutationVariables {
  id: string,
};

export interface DeleteFeedbackMutation {
  feedback:  {
    get:  {
      delete: boolean | null,
    } | null,
  } | null,
};

export interface DeleteFeedbackMessageMutationVariables {
  id: string,
  ids: Array< string >,
};

export interface DeleteFeedbackMessageMutation {
  feedback:  {
    get:  {
      delete_messages: boolean | null,
    } | null,
  } | null,
};

export interface EditFeedbackMessageMutationVariables {
  id: string,
  message: string,
  text: string,
};

export interface EditFeedbackMessageMutation {
  feedback:  {
    get:  {
      edit_message:  {
        id: string | null,
        value: string | null,
      } | null,
    } | null,
  } | null,
};

export interface ListFeedbackQueryVariables {
  filter: FeedbackFilter,
  order?: Array< FeedbackOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface ListFeedbackQuery {
  feedback:  {
    list:  {
      feedbacks:  Array< {
        id: string | null,
        date: string | null,
        last_message_date: string | null,
        last_message:  {
          id: string | null,
          value: string | null,
          date: string | null,
        } | null,
        user:  {
          id: string | null,
          username: string | null,
        } | null,
      } | null > | null,
      count: number | null,
    } | null,
  } | null,
};

export interface ListFeedbackMessageQueryVariables {
  id: string,
  filter: FeedbackMessageFilter,
  limit?: number | null,
  offset?: number | null,
};

export interface ListFeedbackMessageQuery {
  feedback:  {
    get:  {
      messages:  {
        messages:  Array< {
          id: string | null,
          date: string | null,
          value: string | null,
          user:  {
            id: string | null,
            username: string | null,
          } | null,
        } | null > | null,
        count: number | null,
      } | null,
    } | null,
  } | null,
};
