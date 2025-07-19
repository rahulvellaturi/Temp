import React from 'react';
import { shallow, mount, ReactWrapper, ShallowWrapper } from 'enzyme';
import Button from '../Button';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loader2</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
}));

describe('Button Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders button with text', () => {
      const wrapper = shallow(<Button>Click me</Button>);
      
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.type()).toBe('button');
      expect(wrapper.text()).toBe('Click me');
    });

    test('renders button with custom className', () => {
      const wrapper = shallow(<Button className="custom-class">Test</Button>);
      
      expect(wrapper.hasClass('custom-class')).toBe(true);
    });

    test('renders button with default type', () => {
      const wrapper = shallow(<Button>Test</Button>);
      
      expect(wrapper.prop('type')).toBe('button');
    });

    test('renders button with custom type', () => {
      const wrapper = shallow(<Button type="submit">Submit</Button>);
      
      expect(wrapper.prop('type')).toBe('submit');
    });

    test('renders button with custom id', () => {
      const wrapper = shallow(<Button id="test-button">Test</Button>);
      
      expect(wrapper.prop('id')).toBe('test-button');
    });

    test('renders button with data attributes', () => {
      const wrapper = shallow(
        <Button data-testid="test-button" data-custom="value">
          Test
        </Button>
      );
      
      expect(wrapper.prop('data-testid')).toBe('test-button');
      expect(wrapper.prop('data-custom')).toBe('value');
    });

    test('renders button with aria attributes', () => {
      const wrapper = shallow(
        <Button aria-label="Test button" aria-describedby="help-text">
          Test
        </Button>
      );
      
      expect(wrapper.prop('aria-label')).toBe('Test button');
      expect(wrapper.prop('aria-describedby')).toBe('help-text');
    });
  });

  describe('Variants', () => {
    test('renders default variant', () => {
      const wrapper = shallow(<Button>Default</Button>);
      
      expect(wrapper.hasClass('btn-primary')).toBe(true);
    });

    test('renders primary variant', () => {
      const wrapper = shallow(<Button variant="primary">Primary</Button>);
      
      expect(wrapper.hasClass('btn-primary')).toBe(true);
    });

    test('renders secondary variant', () => {
      const wrapper = shallow(<Button variant="secondary">Secondary</Button>);
      
      expect(wrapper.hasClass('btn-secondary')).toBe(true);
    });

    test('renders outline variant', () => {
      const wrapper = shallow(<Button variant="outline">Outline</Button>);
      
      expect(wrapper.hasClass('btn-outline')).toBe(true);
    });

    test('renders ghost variant', () => {
      const wrapper = shallow(<Button variant="ghost">Ghost</Button>);
      
      expect(wrapper.hasClass('btn-ghost')).toBe(true);
    });

    test('renders destructive variant', () => {
      const wrapper = shallow(<Button variant="destructive">Delete</Button>);
      
      expect(wrapper.hasClass('btn-destructive')).toBe(true);
    });

    test('renders link variant', () => {
      const wrapper = shallow(<Button variant="link">Link</Button>);
      
      expect(wrapper.hasClass('btn-link')).toBe(true);
    });
  });

  describe('Sizes', () => {
    test('renders default size', () => {
      const wrapper = shallow(<Button>Default Size</Button>);
      
      expect(wrapper.hasClass('btn-md')).toBe(true);
    });

    test('renders small size', () => {
      const wrapper = shallow(<Button size="sm">Small</Button>);
      
      expect(wrapper.hasClass('btn-sm')).toBe(true);
    });

    test('renders medium size', () => {
      const wrapper = shallow(<Button size="md">Medium</Button>);
      
      expect(wrapper.hasClass('btn-md')).toBe(true);
    });

    test('renders large size', () => {
      const wrapper = shallow(<Button size="lg">Large</Button>);
      
      expect(wrapper.hasClass('btn-lg')).toBe(true);
    });

    test('renders extra large size', () => {
      const wrapper = shallow(<Button size="xl">Extra Large</Button>);
      
      expect(wrapper.hasClass('btn-xl')).toBe(true);
    });

    test('renders icon size', () => {
      const wrapper = shallow(<Button size="icon">🔍</Button>);
      
      expect(wrapper.hasClass('btn-icon')).toBe(true);
    });
  });

  describe('States', () => {
    test('renders disabled state', () => {
      const wrapper = shallow(<Button disabled>Disabled</Button>);
      
      expect(wrapper.prop('disabled')).toBe(true);
      expect(wrapper.hasClass('btn-disabled')).toBe(true);
    });

    test('renders loading state', () => {
      const wrapper = mount(<Button loading>Loading</Button>);
      
      expect(wrapper.prop('disabled')).toBe(true);
      expect(wrapper.hasClass('btn-loading')).toBe(true);
      expect(wrapper.find('[data-testid="loader-icon"]')).toHaveLength(1);
    });

    test('hides text when loading and loadingText not provided', () => {
      const wrapper = mount(<Button loading>Original Text</Button>);
      
      const textContent = wrapper.text();
      expect(textContent).not.toContain('Original Text');
      expect(wrapper.find('[data-testid="loader-icon"]')).toHaveLength(1);
    });

    test('shows loading text when provided', () => {
      const wrapper = mount(
        <Button loading loadingText="Saving...">
          Save
        </Button>
      );
      
      expect(wrapper.text()).toContain('Saving...');
      expect(wrapper.find('[data-testid="loader-icon"]')).toHaveLength(1);
    });

    test('renders active state', () => {
      const wrapper = shallow(<Button active>Active</Button>);
      
      expect(wrapper.hasClass('btn-active')).toBe(true);
    });

    test('renders full width', () => {
      const wrapper = shallow(<Button fullWidth>Full Width</Button>);
      
      expect(wrapper.hasClass('btn-full-width')).toBe(true);
    });
  });

  describe('Icons', () => {
    test('renders left icon', () => {
      const LeftIcon = () => <div data-testid="left-icon">Left</div>;
      const wrapper = mount(
        <Button leftIcon={<LeftIcon />}>
          With Left Icon
        </Button>
      );
      
      expect(wrapper.find('[data-testid="left-icon"]')).toHaveLength(1);
      expect(wrapper.text()).toContain('With Left Icon');
    });

    test('renders right icon', () => {
      const RightIcon = () => <div data-testid="right-icon">Right</div>;
      const wrapper = mount(
        <Button rightIcon={<RightIcon />}>
          With Right Icon
        </Button>
      );
      
      expect(wrapper.find('[data-testid="right-icon"]')).toHaveLength(1);
      expect(wrapper.text()).toContain('With Right Icon');
    });

    test('renders both left and right icons', () => {
      const LeftIcon = () => <div data-testid="left-icon">Left</div>;
      const RightIcon = () => <div data-testid="right-icon">Right</div>;
      const wrapper = mount(
        <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          With Both Icons
        </Button>
      );
      
      expect(wrapper.find('[data-testid="left-icon"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="right-icon"]')).toHaveLength(1);
      expect(wrapper.text()).toContain('With Both Icons');
    });

    test('renders icon-only button', () => {
      const IconComponent = () => <div data-testid="icon-only">🔍</div>;
      const wrapper = mount(
        <Button size="icon" aria-label="Search">
          <IconComponent />
        </Button>
      );
      
      expect(wrapper.find('[data-testid="icon-only"]')).toHaveLength(1);
      expect(wrapper.hasClass('btn-icon')).toBe(true);
      expect(wrapper.prop('aria-label')).toBe('Search');
    });

    test('hides icons when loading', () => {
      const LeftIcon = () => <div data-testid="left-icon">Left</div>;
      const RightIcon = () => <div data-testid="right-icon">Right</div>;
      const wrapper = mount(
        <Button 
          loading 
          leftIcon={<LeftIcon />} 
          rightIcon={<RightIcon />}
        >
          Loading Button
        </Button>
      );
      
      expect(wrapper.find('[data-testid="left-icon"]')).toHaveLength(0);
      expect(wrapper.find('[data-testid="right-icon"]')).toHaveLength(0);
      expect(wrapper.find('[data-testid="loader-icon"]')).toHaveLength(1);
    });
  });

  describe('Event Handling', () => {
    test('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      const wrapper = shallow(<Button onClick={handleClick}>Click me</Button>);
      
      wrapper.simulate('click');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      const wrapper = shallow(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      
      wrapper.simulate('click');
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      const wrapper = shallow(
        <Button onClick={handleClick} loading>
          Loading
        </Button>
      );
      
      wrapper.simulate('click');
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('handles onFocus event', () => {
      const handleFocus = jest.fn();
      const wrapper = shallow(<Button onFocus={handleFocus}>Focus me</Button>);
      
      wrapper.simulate('focus');
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    test('handles onBlur event', () => {
      const handleBlur = jest.fn();
      const wrapper = shallow(<Button onBlur={handleBlur}>Blur me</Button>);
      
      wrapper.simulate('blur');
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    test('handles onMouseEnter event', () => {
      const handleMouseEnter = jest.fn();
      const wrapper = shallow(
        <Button onMouseEnter={handleMouseEnter}>Hover me</Button>
      );
      
      wrapper.simulate('mouseenter');
      
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    test('handles onMouseLeave event', () => {
      const handleMouseLeave = jest.fn();
      const wrapper = shallow(
        <Button onMouseLeave={handleMouseLeave}>Leave me</Button>
      );
      
      wrapper.simulate('mouseleave');
      
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    test('handles onKeyDown event', () => {
      const handleKeyDown = jest.fn();
      const wrapper = shallow(
        <Button onKeyDown={handleKeyDown}>Press key</Button>
      );
      
      wrapper.simulate('keydown', { key: 'Enter' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      );
    });

    test('passes event object to onClick handler', () => {
      const handleClick = jest.fn();
      const wrapper = shallow(<Button onClick={handleClick}>Click me</Button>);
      
      const mockEvent = { preventDefault: jest.fn(), target: {} };
      wrapper.simulate('click', mockEvent);
      
      expect(handleClick).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Accessibility', () => {
    test('has correct default accessibility attributes', () => {
      const wrapper = shallow(<Button>Accessible Button</Button>);
      
      expect(wrapper.prop('type')).toBe('button');
      expect(wrapper.prop('role')).toBeUndefined(); // button has implicit role
    });

    test('supports custom aria-label', () => {
      const wrapper = shallow(
        <Button aria-label="Custom label">🔍</Button>
      );
      
      expect(wrapper.prop('aria-label')).toBe('Custom label');
    });

    test('supports aria-describedby', () => {
      const wrapper = shallow(
        <Button aria-describedby="help-text">Button</Button>
      );
      
      expect(wrapper.prop('aria-describedby')).toBe('help-text');
    });

    test('supports aria-pressed for toggle buttons', () => {
      const wrapper = shallow(
        <Button aria-pressed={true}>Toggle</Button>
      );
      
      expect(wrapper.prop('aria-pressed')).toBe(true);
    });

    test('sets aria-disabled when disabled', () => {
      const wrapper = shallow(<Button disabled>Disabled</Button>);
      
      expect(wrapper.prop('disabled')).toBe(true);
      expect(wrapper.prop('aria-disabled')).toBe(true);
    });

    test('sets aria-busy when loading', () => {
      const wrapper = shallow(<Button loading>Loading</Button>);
      
      expect(wrapper.prop('aria-busy')).toBe(true);
    });

    test('supports tabIndex', () => {
      const wrapper = shallow(<Button tabIndex={-1}>No Tab</Button>);
      
      expect(wrapper.prop('tabIndex')).toBe(-1);
    });

    test('supports role override', () => {
      const wrapper = shallow(<Button role="link">Link Button</Button>);
      
      expect(wrapper.prop('role')).toBe('link');
    });
  });

  describe('Form Integration', () => {
    test('works as form submit button', () => {
      const wrapper = shallow(<Button type="submit">Submit Form</Button>);
      
      expect(wrapper.prop('type')).toBe('submit');
    });

    test('works as form reset button', () => {
      const wrapper = shallow(<Button type="reset">Reset Form</Button>);
      
      expect(wrapper.prop('type')).toBe('reset');
    });

    test('supports form attribute', () => {
      const wrapper = shallow(
        <Button form="my-form" type="submit">
          External Submit
        </Button>
      );
      
      expect(wrapper.prop('form')).toBe('my-form');
      expect(wrapper.prop('type')).toBe('submit');
    });

    test('supports name attribute', () => {
      const wrapper = shallow(
        <Button name="action" value="save">
          Save
        </Button>
      );
      
      expect(wrapper.prop('name')).toBe('action');
      expect(wrapper.prop('value')).toBe('save');
    });
  });

  describe('CSS Classes', () => {
    test('combines multiple classes correctly', () => {
      const wrapper = shallow(
        <Button 
          variant="primary" 
          size="lg" 
          className="custom-class"
          disabled
          active
          fullWidth
        >
          Multi Class
        </Button>
      );
      
      expect(wrapper.hasClass('btn-primary')).toBe(true);
      expect(wrapper.hasClass('btn-lg')).toBe(true);
      expect(wrapper.hasClass('custom-class')).toBe(true);
      expect(wrapper.hasClass('btn-disabled')).toBe(true);
      expect(wrapper.hasClass('btn-active')).toBe(true);
      expect(wrapper.hasClass('btn-full-width')).toBe(true);
    });

    test('handles empty className gracefully', () => {
      const wrapper = shallow(<Button className="">Empty Class</Button>);
      
      expect(wrapper.prop('className')).toContain('btn');
    });

    test('handles undefined className gracefully', () => {
      const wrapper = shallow(<Button className={undefined}>No Class</Button>);
      
      expect(wrapper.prop('className')).toContain('btn');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty children', () => {
      const wrapper = shallow(<Button></Button>);
      
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toBe('');
    });

    test('handles null children', () => {
      const wrapper = shallow(<Button>{null}</Button>);
      
      expect(wrapper.exists()).toBe(true);
    });

    test('handles undefined children', () => {
      const wrapper = shallow(<Button>{undefined}</Button>);
      
      expect(wrapper.exists()).toBe(true);
    });

    test('handles multiple children', () => {
      const wrapper = shallow(
        <Button>
          <span>First</span>
          <span>Second</span>
        </Button>
      );
      
      expect(wrapper.find('span')).toHaveLength(2);
    });

    test('handles boolean false as child', () => {
      const wrapper = shallow(<Button>{false}</Button>);
      
      expect(wrapper.exists()).toBe(true);
    });

    test('handles number as child', () => {
      const wrapper = shallow(<Button>{42}</Button>);
      
      expect(wrapper.text()).toBe('42');
    });

    test('handles array of children', () => {
      const children = ['First', 'Second'];
      const wrapper = shallow(<Button>{children}</Button>);
      
      expect(wrapper.text()).toContain('First');
      expect(wrapper.text()).toContain('Second');
    });
  });

  describe('Performance', () => {
    test('renders efficiently with minimal props', () => {
      const startTime = performance.now();
      const wrapper = shallow(<Button>Simple</Button>);
      const endTime = performance.now();
      
      expect(wrapper.exists()).toBe(true);
      expect(endTime - startTime).toBeLessThan(10); // Should render quickly
    });

    test('renders efficiently with all props', () => {
      const handleClick = jest.fn();
      const LeftIcon = () => <div>Left</div>;
      const RightIcon = () => <div>Right</div>;
      
      const startTime = performance.now();
      const wrapper = mount(
        <Button
          variant="primary"
          size="lg"
          disabled={false}
          loading={false}
          active={true}
          fullWidth={true}
          leftIcon={<LeftIcon />}
          rightIcon={<RightIcon />}
          onClick={handleClick}
          className="complex-button"
          id="complex-btn"
          type="button"
          aria-label="Complex button"
          data-testid="complex-button"
        >
          Complex Button
        </Button>
      );
      const endTime = performance.now();
      
      expect(wrapper.exists()).toBe(true);
      expect(endTime - startTime).toBeLessThan(20); // Should still render reasonably quickly
    });
  });

  describe('Memory Management', () => {
    test('unmounts cleanly', () => {
      const wrapper = mount(<Button>Unmount Test</Button>);
      
      expect(wrapper.exists()).toBe(true);
      
      wrapper.unmount();
      
      expect(wrapper.exists()).toBe(false);
    });

    test('cleans up event listeners on unmount', () => {
      const handleClick = jest.fn();
      const wrapper = mount(<Button onClick={handleClick}>Click me</Button>);
      
      wrapper.simulate('click');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      wrapper.unmount();
      
      // After unmount, no more events should be handled
      expect(wrapper.exists()).toBe(false);
    });
  });

  describe('Component Integration', () => {
    test('works within forms', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      const wrapper = mount(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      wrapper.find('form').simulate('submit');
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('works with refs', () => {
      const ref = React.createRef<HTMLButtonElement>();
      const wrapper = mount(<Button ref={ref}>With Ref</Button>);
      
      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('BUTTON');
    });

    test('forwards all HTML button props', () => {
      const wrapper = shallow(
        <Button
          autoFocus
          formAction="/submit"
          formEncType="multipart/form-data"
          formMethod="post"
          formNoValidate
          formTarget="_blank"
        >
          HTML Props
        </Button>
      );
      
      expect(wrapper.prop('autoFocus')).toBe(true);
      expect(wrapper.prop('formAction')).toBe('/submit');
      expect(wrapper.prop('formEncType')).toBe('multipart/form-data');
      expect(wrapper.prop('formMethod')).toBe('post');
      expect(wrapper.prop('formNoValidate')).toBe(true);
      expect(wrapper.prop('formTarget')).toBe('_blank');
    });
  });
});