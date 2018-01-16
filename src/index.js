import React, { Component } from 'react';
import PropTypes from 'prop-types';

const IS_SVG_SUPPORTED = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect);

class GracefulImage extends Component {
  constructor(props) {
    super(props);

    let placeholder = null;
    if (IS_SVG_SUPPORTED) {
      let width = (this.props.style && this.props.style.width) ? this.props.style.width : this.props.width ? this.props.width : '200';
      let height = (this.props.style && this.props.style.height) ? this.props.style.height : this.props.height ? this.props.height : '150';
      placeholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'{{w}}' height%3D'{{h}}' viewBox%3D'0 0 {{w}} {{h}}'%2F%3E";
      placeholder = placeholder.replace(/{{w}}/g, width).replace(/{{h}}/g, height);
    }

    this.state = {
      imageWorks: false,
      retryDelay: this.props.retry.delay,
      retryCount: 1,
      placeholder: placeholder
    };
  }

  /*
    Attempts to load an image src passed via props
    and utilises image events to track sccess / failure of the loading
  */
  componentDidMount() {
    // if user has not opted-out from retrying then handle re-trying
    if (!this.props.noRetry) {
      let image = new Image();

      image.onload = () => {
        this.setState({ imageWorks: true });
      }

      image.onerror = () => {
        this.handleImageRetries(image);
      }

      image.src = this.props.src;
    } else {
      return;
    }
  }

  /*
    Handles the actual re-attempts of loading the image
    following the default / provided retry algorithm
  */
  handleImageRetries(image) {
    this.setState({ imageWorks: false }, () => {

      if (this.state.retryCount <= this.props.retry.count) {

        setTimeout(() => {
          // re-attempt fetching the image
          image.src = this.props.src;

          // update count and delay
          this.setState((prevState) => {
            let updateDelay;
            if (this.props.retry.accumulate === 'multiply') {
              updateDelay = prevState.retryDelay * this.props.retry.delay;
            } else if (this.props.retry.accumulate === 'add') {
              updateDelay = prevState.retryDelay + this.props.retry.delay;
            } else if (this.props.retry.accumulate === 'noop') {
              updateDelay = this.props.retry.delay;
            } else {
              updateDelay = 'multiply';
            }

            return {
              retryDelay: updateDelay,
              retryCount: prevState.retryCount + 1
            };
          });
        }, this.state.retryDelay * 1000);
      }

    });
  }

  /*
    - if user didn't want a placeholder OR SVG not supported AND image doesn't work then don't render anything
    - if image failed to load then render the placeholder
    - else the image worked so render the image
  */
  render() {
    if ((this.props.noPlaceholder || !IS_SVG_SUPPORTED) && !this.state.imageWorks) return null;

    if (!this.state.imageWorks && !this.props.noPlaceholder && IS_SVG_SUPPORTED) {
      return (
        <img
           src={this.state.placeholder}
           className={this.props.className}
           width={this.props.width}
           height={this.props.height}
           style={{backgroundColor: this.props.placeholderColor, ...this.props.style}}
           alt={this.props.alt}
        />
      );
    } else {
      return (
        <img
          src={this.props.src}
          className={this.props.className}
          width={this.props.width}
          height={this.props.height}
          style={{...this.props.style}}
          alt={this.props.alt}
        />
      );
    }

  }
}


GracefulImage.defaultProps = {
  src: null,
  className: null,
  width: null,
  height: null,
  alt: 'Broken image placeholder',
  style: {},
  placeholderColor: '#eee',
  retry: {
    count: 8,
    delay: 2,
    accumulate: 'multiply'
  },
  noRetry: false,
  noPlaceholder: false
};

GracefulImage.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  height: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  alt: PropTypes.string,
  style: PropTypes.object,
  placeholderColor: PropTypes.string,
  retry: PropTypes.shape({
    count: PropTypes.number,
    delay: PropTypes.number,
    accumulate: PropTypes.string,
  }),
  noRetry: PropTypes.bool,
  noPlaceholder: PropTypes.bool
};

export default GracefulImage;
