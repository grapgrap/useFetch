# useFetch

## Installation

```
yarn add @grapgrap/use-fetch
```

This package need `react` and `react-dom` as peer dependencies.

```
yarn add react react-dom
```

## Usage

### useFetch

`useFetch` use [`swr`](https://swr.vercel.app) internally.

So, Return of `useFetch` is similar with `useSWR`.

```typescript
useFetch = <Data, Params>(
  def?: APIDef<Data, Params>,
  params?: Params,
  fallbackData?: Data,
  options: {
    axiosConfig?: AxiosRequestConfig;
    swrConfig?: SWRConfiguration<Data>;
  } = {}
): {
  data?: Data;
  error?: APIError;
  loading: boolean;
  mutate: KeyedMutator<Data>;
}
```

**Conditional fetch**

`useFetch` call api when only has APIDef.

```typescript
const userId = user?.id;

useFetch(userId && GetUserAPIDef, {
  params: {
    id: userId,
  },
});
```

### API Definition

```typescript
type User = {
  name: string;
};

type Params = {
  id: string;
};

const GetUserByIdAPIDef: APIDef<User, { params: Params }> = {
  url: '/user/{id}',
  method: 'GET',
};
```

`useFetch` consumes special config is called `APIDef`.

`APIDef` is similar with `AxiosRequestConfig`.

`APIDef` can have `url` and `method`, another `baseURL`.

And `APIDef` can have types of response and request params, request body.

But special thing is, `APIDef` can interpolate params in url.

#### URL Interpolation

**1. Simple case**

```typescript
const id = 'something_user_id';

useFetch(GetUserByIdAPIDef, {
  params: { id },
});

// interpolated url: `/user/something_user_id`
```

**2. Multiple interpolation case**

```typescript
type Params = {
  store_id: string;
  item_id: string;
};

const GetItemInStoreAPI: APIDef<Item, { params: Params }> = {
  url: '/stores/{store_id}/items/{item_id}',
};

useFetch(GetItemInStoreAPI, {
  params: {
    store_id: 's_131425',
    item_id: 'i_41525',
  },
});

// interpolated url: `/stores/s_131425/items/i_41525`
```

**3. Rest parameter after interpolate**

```typescript
type Params = {
  store_id: string;
  offset: number;
  limit: number;
};

const GetItemListInStoreAPI: APIDef<Item, { params: Params }> = {
  url: '/stores/{store_id}/items/',
};

useFetch(GetItemListInStoreAPI, {
  params: {
    store_id: 's_131425',
    offset: 0,
    limit: 10,
  },
});

// interpolated url: '/stores/s_131425'
// parameter: { offset: 0, limit: 10 }
```
