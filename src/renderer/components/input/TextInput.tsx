import { ApiPackage, ApiResponse } from '@components/settings/ServerSettings';
import React, { useEffect, useState } from 'react';
import './TextInput.scss';

interface TextInputProps {
  value: string;
  placeHolder: string;
  numbersOnly?: boolean;
  emptyAllowed?: boolean;
  onValueChange: (value: string) => void;
  fetchSuggestions?: (query: string) => Promise<ApiResponse>;
}

const TextInput = ({
  value,
  placeHolder,
  numbersOnly,
  emptyAllowed,
  fetchSuggestions,
  onValueChange,
}: TextInputProps) => {
  const [currValue, setCurrValue] = useState(value);
  const [suggestions, setSuggestions] = useState<ApiPackage[]>([]);
  const [isFetching, setFetching] = useState(false);
  const [isFocussed, setFocus] = useState(false);
  const [isHovering, setHovering] = useState(false);

  // Update
  useEffect(() => {
    setCurrValue(value);
  }, [value]);

  // Debounce update
  useEffect(() => {
    const updateStore = setTimeout(() => {
      if (currValue.trim() != value && isValidInput()) {
        onValueChange(currValue);

        if (isFocussed && fetchSuggestions) {
          setSuggestions([]);
          setFetching(true);
          fetchSuggestions(currValue)
            .then((data) => {
              setSuggestions(data.Packages);
              setFetching(false);
            })
            .catch((err) => {
              if (err.name === 'AbortError') {
                console.log('Suggestion fetch request aborted');
              } else {
                console.error(err);
              }
            });
        }
      } else if (!isValidInput()) {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(updateStore);
  }, [currValue]);

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    setCurrValue(event.currentTarget.value);
  };

  const isValidInput = (): boolean => {
    return emptyAllowed || (currValue && currValue.toString().length > 0);
  };

  return (
    <div className='textInput'>
      <input
        className={isValidInput() ? '' : 'invalid'}
        value={currValue}
        onInput={handleInputChange}
        type={numbersOnly ? 'number' : 'text'}
        placeholder={placeHolder}
        onFocus={() => {
          setFocus(true);
        }}
        onBlur={() => {
          setFocus(false);
        }}
      />
      {fetchSuggestions && (
        <div
          className={
            'scrollWrapper show' +
            (isFocussed || isHovering ? ' show' : '') +
            (suggestions.length == 0 ? ' empty' : '')
          }
        >
          {isFetching && <span className='loading'>Loading...</span>}
          <div
            className='suggestions'
            onMouseEnter={() => {
              setHovering(true);
            }}
            onMouseLeave={() => {
              setHovering(false);
            }}
          >
            {!isFetching &&
              suggestions.map((suggestion) => (
                <div
                  className='suggestion'
                  onClick={() => {
                    setFocus(false);
                    setSuggestions([]);
                    setCurrValue(suggestion.FullIdent);
                  }}
                >
                  <img src={suggestion.Thumb}></img>
                  <div className='content'>
                    <div className='top'>
                      <span className='title'>{suggestion.Title}</span>
                      <span className='ident'>({suggestion.FullIdent})</span>
                    </div>
                    <span className='summary'>
                      {suggestion.Summary.length > 0
                        ? suggestion.Summary
                        : 'No description'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextInput;
