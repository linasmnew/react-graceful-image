import React from 'react'
import Enzyme, { mount, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import GracefulImage from '../src';

Enzyme.configure({ adapter: new Adapter() });

describe('react-graceful-image', () => {
  it('should render SVG placeholder when image has not loaded', () => {
    const props = {
      src: 'https://linasmickevicius.com/images/browser.png',
      width: '150',
      height: '150',
    };
    let placeholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'{{w}}' height%3D'{{h}}' viewBox%3D'0 0 {{w}} {{h}}'%2F%3E";
    placeholder = placeholder.replace(/{{w}}/g, props.width).replace(/{{h}}/g, props.height);

    const shallowWrapper = shallow(<GracefulImage {...props} />);

    expect(shallowWrapper.find('img').length).toBe(1);
    expect(shallowWrapper.find('img').prop('src')).toEqual(placeholder);
    expect(shallowWrapper.find('img').prop('width')).toEqual(props.width);
    expect(shallowWrapper.find('img').prop('height')).toEqual(props.height);
  });

  it('should render image when image has loaded', () => {
    const props = {
      src: 'https://linasmickevicius.com/images/browser.png',
      width: '150',
      height: '150',
    };
    const shallowWrapper = shallow(<GracefulImage {...props} />);
    shallowWrapper.setState({ loaded: true });

    expect(shallowWrapper.find('img').length).toBe(1);
    expect(shallowWrapper.find('img').prop('src')).toEqual(props.src);
    expect(shallowWrapper.find('img').prop('width')).toEqual(props.width);
    expect(shallowWrapper.find('img').prop('height')).toEqual(props.height);
  });

  it('should not render anything when given noPlaceholder prop until image has loaded', () => {
    const props = {
      src: 'https://linasmickevicius.com/images/browser.png',
      width: '150',
      height: '150',
      noPlaceholder: true,
    };
    const shallowWrapper = shallow(<GracefulImage {...props} />);
    expect(shallowWrapper.find('img').length).toBe(0);

    shallowWrapper.setState({ loaded: true });
    expect(shallowWrapper.find('img').length).toBe(1);
  });

  it('should change placeholder\'s color', () => {
    const props = {
      src: 'https://linasmickevicius.com/images/browser.png',
      width: '150',
      height: '150',
      placeholderColor: '#aaa',
    };
    let background = `${props.placeholderColor} url(${props.src}) 0 0 / 0 0 no-repeat`;
    const shallowWrapper = shallow(<GracefulImage {...props} />);

    expect(shallowWrapper.find('img').prop('style')).toHaveProperty('background', background);
  });

  it('should change placeholder\'s and loaded image\'s alt value', () => {
    const props = {
      src: 'https://linasmickevicius.com/images/browser.png',
      width: '150',
      height: '150',
      alt: 'hello world',
    };
    const shallowWrapper = shallow(<GracefulImage {...props} />);
    expect(shallowWrapper.find('img').prop('alt')).toEqual(props.alt);

    shallowWrapper.setState({ loaded: true });
    expect(shallowWrapper.find('img').prop('alt')).toEqual(props.alt);
  });

  it('should apply className to placeholder image and loaded image', () => {
    const props = {
      src: 'https://linasmickevicius.com/images/browser.png',
      width: '150',
      height: '150',
      className: 'graceful_image',
    };
    const shallowWrapper = shallow(<GracefulImage {...props} />);
    expect(shallowWrapper.find('img').prop('className')).toEqual(props.className);

    shallowWrapper.setState({ loaded: true });
    expect(shallowWrapper.find('img').prop('className')).toEqual(props.className);
  });
});
