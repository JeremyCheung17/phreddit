import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Banner from '../client/src/Banner';

jest.mock('axios');

describe('Create Post Button Tests', () => {
  const mockPageSwitch = jest.fn();
  const mockHandleLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Create Post button should be disabled when user is null (guest)', () => {
    render(
      <Banner 
        pageSwitch={mockPageSwitch}
        isPost={false}
        user={null}
        handleLogout={mockHandleLogout}
      />
    );

    const createPostButton = screen.getByText('Create Post');
    expect(createPostButton).toBeDisabled();
  });

  test('Create Post button should be enabled when user is logged in', () => {
    const mockUser = {
      displayName: 'testuser',
      email: 'test@example.com',
      userType: 'regular'
    };

    render(
      <Banner 
        pageSwitch={mockPageSwitch}
        isPost={false}
        user={mockUser}
        handleLogout={mockHandleLogout}
      />
    );

    const createPostButton = screen.getByText('Create Post');
    expect(createPostButton).not.toBeDisabled();
  });

});