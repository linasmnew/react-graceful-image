import React, { Component } from 'react';
import PropTypes from 'prop-types';

const IS_SVG_SUPPORTED = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect);

class GracefulImage extends Component {
  state = {
    imageWorks: false,
    retryDelay: (this.props.retry && this.props.retry.delay) || 2,
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

      if (this.state.retryCount <= this.props.retry.count) {

        setTimeout(() => {
          // re-attempt fetching the image
          image.src = this.props.src;

          // update count and delay
          this.setState((prevState) => {
            let updateDelay;
            if (this.props.retry.algorithm === 'multiply') {
              updateDelay = prevState.retryDelay * this.props.retry.delay;
            } else if (this.props.retry.algorithm === 'add') {
              updateDelay = prevState.retryDelay + this.props.retry.delay;
            } else if (this.props.retry.algorithm === 'noop') {
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
      <svg
        role='img'
        aria-label={this.props.alt}
        width={this.props.width ? this.props.width : this.props.placeholder.width}
        height={this.props.height ? this.props.height : this.props.placeholder.height}
      >
        <rect width='100%' height='100%' fill={this.props.placeholder.color} />
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
  placeholder: {
    width: 150,
    height: 150,
    color: '#eee'
  },
  retry: {
    count: 8,
    delay: 2,
    algorithm: 'multiply'
  },
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
  placeholder: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.String,
  }),
  retry: PropTypes.shape({
    count: PropTypes.number,
    delay: PropTypes.number,
    algorithm: PropTypes.String,
  }),
  noRetry: PropTypes.bool,
  noPlaceholder: PropTypes.bool
};

export default GracefulImage;
