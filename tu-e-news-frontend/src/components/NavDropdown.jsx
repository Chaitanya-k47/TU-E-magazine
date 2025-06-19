// src/components/NavDropdown.jsx
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi'; // Chevron for dropdown indication

function NavDropdown({ buttonText = "More", items }) {
  if (!items || items.length === 0) {
    return null; // Don't render if no items
  }

  return (
    <div className="relative inline-block text-left z-20"> {/* z-index to ensure dropdown is on top */}
      <Menu as="div">
        <div>
          <Menu.Button className="inline-flex items-center justify-center w-full rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 transition-colors duration-150">
            {buttonText}
            <FiChevronDown
              className="ml-1 -mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              {items.map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => ( // 'active' here refers to hover/keyboard focus on the item
                    <Link
                      to={item.href}
                      className={`${
                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {/* You can add icons to menu items if desired: item.icon */}
                      {item.name}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

export default NavDropdown;