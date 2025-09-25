import { useState } from 'react';

export type ApiPackage = {
  Title: string;
  FullIdent: string;
  Thumb: string;
  Summary: string;
};

export type ApiResponse = {
  TotalCount: number;
  Packages: ApiPackage[];
};

const baseURL = 'https://services.facepunch.com/sbox/package/find/1?';

const useFPApi = () => {
  const [abortController, setAbortController] = useState(new AbortController());

  const searchPackage = async (
    query: string,
    type: string,
  ): Promise<ApiResponse> => {
    let controller = abortController;

    // Cancel prev request before starting new one
    if (abortController) {
      abortController.abort();
      controller = new AbortController();
      setAbortController(controller);
    }

    const result = await fetch(
      `${baseURL}q=${query}+type:${type}+sort:popular&take=20`,
      {
        signal: controller.signal,
      },
    );

    return await result.json();
  };

  return searchPackage;
};

export default useFPApi;
