import React from "react";
import ReactDOM from "react-dom";
import Enzyme, { mount, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import GracefulImage from "../src";

Enzyme.configure({ adapter: new Adapter() });

jest.useFakeTimers();

describe("react-graceful-image", () => {
  let imageOnError;
  let imageSrcCount;

  Object.defineProperty(Image.prototype, 'onerror', {
    get: function () {
      return this._onerror;
    },
    set: function (fn) {
      imageOnError = fn;
      this._onerror = fn;
    },
  });

  Object.defineProperty(Image.prototype, 'src', {
    get: function () {
      return this._src;
    },
    set: function (src) {
      imageSrcCount++;
      this._src = src;
    },
  });

  beforeEach(() => {
    imageOnError = null;
    imageSrcCount = 0;
  });

  it("should render without error", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150"
    };
    const div = document.createElement("div");
    ReactDOM.render(<GracefulImage {...props} />, div);
  });

  it("should render SVG placeholder when image has not loaded", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150"
    };
    let placeholder =
      "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'{{w}}' height%3D'{{h}}' viewBox%3D'0 0 {{w}} {{h}}'%2F%3E";
    placeholder = placeholder
      .replace(/{{w}}/g, props.width)
      .replace(/{{h}}/g, props.height);

    const mountWrapper = mount(<GracefulImage {...props} />);

    expect(mountWrapper.find("img").length).toBe(1);
    expect(mountWrapper.find("img").prop("src")).toEqual(placeholder);
    expect(mountWrapper.find("img").prop("width")).toEqual(props.width);
    expect(mountWrapper.find("img").prop("height")).toEqual(props.height);
  });

  it("should render image when image has loaded", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150"
    };
    const mountWrapper = mount(<GracefulImage {...props} />);
    mountWrapper.setState({ loaded: true });

    expect(mountWrapper.find("img").length).toBe(1);
    expect(mountWrapper.find("img").prop("src")).toEqual(props.src);
    expect(mountWrapper.find("img").prop("width")).toEqual(props.width);
    expect(mountWrapper.find("img").prop("height")).toEqual(props.height);
  });

  it("should not render anything when given noPlaceholder prop until image has loaded", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150",
      noPlaceholder: true
    };
    const mountWrapper = mount(<GracefulImage {...props} />);
    expect(mountWrapper.find("img").length).toBe(0);

    mountWrapper.setState({ loaded: true });
    expect(mountWrapper.find("img").length).toBe(1);
  });

  it("should change placeholder's color", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150",
      placeholderColor: "#aaa"
    };
    const mountWrapper = mount(<GracefulImage {...props} />);

    expect(mountWrapper.find("img").prop("style")).toHaveProperty(
      "background",
      props.placeholderColor
    );
  });

  it("should change placeholder's and loaded image's alt value", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150",
      alt: "hello world"
    };
    const mountWrapper = mount(<GracefulImage {...props} />);
    expect(mountWrapper.find("img").prop("alt")).toEqual(props.alt);

    mountWrapper.setState({ loaded: true });
    expect(mountWrapper.find("img").prop("alt")).toEqual(props.alt);
  });

  it("should apply className to placeholder image and loaded image", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150",
      className: "graceful_image"
    };
    const mountWrapper = mount(<GracefulImage {...props} />);
    expect(mountWrapper.find("img").prop("className")).toEqual(
      props.className
    );

    mountWrapper.setState({ loaded: true });
    expect(mountWrapper.find("img").prop("className")).toEqual(
      props.className
    );
  });

  it("should register load, scroll, resize and gestureend event listeners", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150"
    };
    const spy = jest.spyOn(window, "addEventListener");
    shallow(<GracefulImage {...props} />);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[0][0]).toEqual("load");
    expect(spy.mock.calls[1][0]).toEqual("scroll");
    expect(spy.mock.calls[2][0]).toEqual("resize");
    expect(spy.mock.calls[3][0]).toEqual("gestureend");
    spy.mockClear();
  });

  it("should not register any event listeners when given noLazyLoad prop", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150",
      noLazyLoad: true
    };
    const spy = jest.spyOn(window, "addEventListener");
    shallow(<GracefulImage {...props} />);

    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockClear();
  });

  it("should not retry loading image when noRetry is true", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150",
      noRetry: true,
    };

    mount(<GracefulImage {...props} />);

    imageOnError();
    jest.runAllTimers();
    expect(imageSrcCount).toBe(1);
  });

  it("should retry when noRetry is false", () => {
    const props = {
      src: "https://linasmickevicius.com/images/browser.png",
      width: "150",
      height: "150",
    };

    mount(<GracefulImage {...props} />);

    imageOnError();
    jest.runAllTimers();
    expect(imageSrcCount).toBe(2);
  });
});
