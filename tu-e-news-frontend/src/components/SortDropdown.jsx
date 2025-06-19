// src/components/SortDropdown.jsx
import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
// Import FiSliders or another available icon instead of FiArrowDownUp
import { FiCheck, FiChevronDown, FiSliders } from 'react-icons/fi'; // Changed FiArrowDownUp to FiSliders

function SortDropdown({ options, selectedValue, onChange }) {
  const selectedOption = options.find(option => option.value === selectedValue) || options[0];

  return (
    <div className="relative w-full sm:w-56 z-10">
      <Listbox value={selectedValue} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm transition-colors hover:bg-gray-50 ui-open:ring-2 ui-open:ring-blue-500 ui-open:border-blue-500">
            <span className="flex items-center">
              {/* Use the new icon */}
              <FiSliders className="mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
              <span className="block truncate text-gray-700">{selectedOption.label}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FiChevronDown
                className="h-5 w-5 text-gray-400 ui-open:transform ui-open:rotate-180 transition-transform duration-150"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className="relative cursor-default select-none py-2 pl-10 pr-4 ui-active:bg-blue-100 ui-active:text-blue-900 text-gray-900"
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-semibold text-blue-700' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <FiCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default SortDropdown;