import React, { Component } from 'react';
import PropTypes from 'prop-types';

const RETRY_COUNT_LIMIT = 8;
const IS_SVG_SUPPORTED = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect)

class GracefulImage extends Component {
  state = {
    imageWorks: false,
    retryDelay: 2,
    retryCount: 1,
  };

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

  handleImageRetries = (image) => {
    this.setState({ imageWorks: false }, () => {
      // if no custom retry settings then use the default settings
      if (!this.props.retry) {

        // default retry is every 2^1...RETRY_COUNT_LIMIT seconds
        if (this.state.retryCount <= RETRY_COUNT_LIMIT) {
          setTimeout(() => {
            image.src = this.props.src;
            this.setState((prevState) => ({
              retryDelay: prevState.retryDelay * 2,
              retryCount: prevState.retryCount + 1
            }));
          }, this.state.retryDelay * 1000);
        }

      } else { // else use the custom provided retry config

        if (this.state.retryCount <= this.props.retry.count) {
          setTimeout(() => {
            image.src = this.props.src;
            this.setState((prevState) => ({
              retryDelay: prevState.retryDelay + this.props.retry.delay,
              retryCount: prevState.retryCount + 1
            }));
          }, this.state.retryDelay * 1000);
        }

      }
    });
  }

  /*
    if image failed to load AND
      user didn't want a placeholder OR no support for SVG
        then don't render anything

    if image failed to load AND
      user wants a placeholder AND SVG support exists
        then render the placeholder

    if image worked
      then render the image
  */
  render() {
    if (!this.state.imageWorks && (this.props.noPlaceholder || !IS_SVG_SUPPORTED)) return null;

    if (!this.state.imageWorks && !this.props.noPlaceholder && IS_SVG_SUPPORTED ) return (
      <svg role='img' aria-label='Broken image placeholder' width={this.props.width} height={this.props.height}>
        <rect width='100%' height='100%' fill={this.props.placeholderColor} />
      </svg>
    );

    if (this.state.imageWorks) return (
      <img
        src={this.props.src}
        className={this.props.className}
        style={{...this.props.style}}
        width={this.props.width}
        height={this.props.height}
        alt={this.props.alt}
      />
    );
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
  retry: null,
  noRetry: false,
  noPlaceholder: false
};

GracefulImage.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  alt: PropTypes.string,
  style: PropTypes.object,
  placeholderColor: PropTypes.string,
  retry: PropTypes.shape({
    count: PropTypes.number,
    delay: PropTypes.number
  }),
  noRetry: PropTypes.bool,
  noPlaceholder: PropTypes.bool
};

export default GracefulImage;
