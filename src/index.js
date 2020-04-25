import React, { Component } from 'react'
import throttle from 'lodash.throttle'

const registerListener = (event, fn) => {
    if (window.addEventListener) {
        window.addEventListener(event, fn)
    } else {
        window.attachEvent('on' + event, fn)
    }
}

const isInViewport = el => {
    if (el) {
        const rect = el.getBoundingClientRect()

        return rect.top >= 0 &&
            rect.left >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    }
}

const fadeIn = `
  @keyframes gracefulimage {
    0%   { opacity: 0.25; }
    50%  { opacity: 0.5; }
    100% { opacity: 1; }
  }
`

class GracefulImage extends Component {
    constructor (props) {
        super(props)

        this._isMounted = false
        this.throttledFunction = throttle(this.lazyLoad, 150)
        this.state = {
            loaded: false,
            retryDelay: this.props.retry.delay,
            retryCount: 1
        }
    }

    /*
    Creating a stylesheet to hold the fading animation
  */
    addAnimationStyles () {
        const exists = document.head.querySelectorAll('[data-gracefulimage]')

        if (!exists.length) {
            const styleElement = document.createElement('style')

            styleElement.setAttribute('data-gracefulimage', 'exists')
            document.head.appendChild(styleElement)
            styleElement.sheet.insertRule(fadeIn, styleElement.sheet.cssRules.length)
        }
    }

    /*
    Marks an image as loaded
   */
    setLoaded () {
        if (this._isMounted) {
            this.setState({ loaded: true }, this.props.onLoad)
        }
    }

    /*
    Attempts to download an image, and tracks its success / failure
  */
    loadImage () {
        const image = new Image()

        image.onload = () => {
            this.setLoaded()
        }
        image.onerror = () => {
            this.handleImageRetries(image)
        }
        image.src = this.props.src
    }

  /*
    If placeholder is currently within the viewport then load the actual image
    and remove all event listeners associated with it
  */
  lazyLoad = () => {
      if (isInViewport(this.imageRef)) {
          this.clearEventListeners()
          this.loadImage()
      }
  };

  /*
    Attempts to load an image src passed via props
    and utilises image events to track sccess / failure of the loading
  */
  componentDidMount () {
      this._isMounted = true
      this.addAnimationStyles()

      // if user wants to lazy load
      if (!this.props.noLazyLoad) {
          // check if already within viewport to avoid attaching listeners
          if (isInViewport(this.imageRef)) {
              this.loadImage()
          } else {
              registerListener('load', this.throttledFunction)
              registerListener('scroll', this.throttledFunction)
              registerListener('resize', this.throttledFunction)
              registerListener('gestureend', this.throttledFunction) // to detect pinch on mobile devices
          }
      } else {
          this.loadImage()
      }
  }

  clearEventListeners () {
      this.throttledFunction.cancel()
      window.removeEventListener('load', this.throttledFunction)
      window.removeEventListener('scroll', this.throttledFunction)
      window.removeEventListener('resize', this.throttledFunction)
      window.removeEventListener('gestureend', this.throttledFunction)
  }

  /*
    Clear timeout incase retry is still running
    And clear any existing event listeners
  */
  componentWillUnmount () {
      this._isMounted = false

      if (this.timeout) {
          window.clearTimeout(this.timeout)
      }
      this.clearEventListeners()
  }

  /*
    Handles the actual re-attempts of loading the image
    following the default / provided retry algorithm
  */
  handleImageRetries (image) {
      const {
          src,
          retry: {
              count,
              delay,
              accumulate
          },
          onError
      } = this.props
      const {
          retryCount,
          retryDelay
      } = this.state
      // if we are not mounted anymore, we do not care, and we can bail
      if (!this._isMounted) return

      this.setState({ loaded: false }, () => {
          if (retryCount <= count) {
              this.timeout = setTimeout(() => {
                  // if we are not mounted anymore, we do not care, and we can bail
                  if (!this._isMounted) return

                  // re-attempt fetching the image
                  image.src = src

                  // update count and delay
                  this.setState(prevState => {
                      let updatedRetryDelay

                      if (accumulate === 'multiply') {
                          updatedRetryDelay = prevState.retryDelay * delay
                      } else if (accumulate === 'add') {
                          updatedRetryDelay = prevState.retryDelay + delay
                      } else {
                          updatedRetryDelay = delay
                      }

                      return {
                          retryDelay: updatedRetryDelay,
                          retryCount: prevState.retryCount + 1
                      }
                  })
              }, retryDelay * 1000)
          } else {
              onError()
          }
      })
  }

  setImageRef = el => {
      this.imageRef = el
  }

  /*
    - If image hasn't yet loaded AND user didn't want a placeholder then don't render anything
    - Else if image has loaded then render the image
    - Else render the placeholder
  */
  render () {
      const {
          src,
          noPlaceholder,
          placeholderColor,
          srcSet,
          className,
          width,
          height,
          style,
          alt,
          customPlaceholder
      } = this.props
      const { loaded } = this.state
      const imageSrc = loaded ? src : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      const imageStyle = loaded
          ? {
              animationName: 'gracefulimage',
              animationDuration: '0.3s',
              animationIterationCount: 1,
              animationTimingFunction: 'ease-in'
          }
          : { background: placeholderColor }

      if (!loaded && noPlaceholder) {
          return null
      } else if (!loaded && customPlaceholder) {
          return customPlaceholder(this.setImageRef)
      } else {
          return (
              <img
                  src={ imageSrc }
                  srcSet={ srcSet }
                  className={ className }
                  width={ width }
                  height={ height }
                  style={ {
                      ...imageStyle,
                      ...style
                  } }
                  alt={ alt }
                  ref={ this.setImageRef }
              />
          )
      }
  }
}

GracefulImage.defaultProps = {
    placeholderColor: '#eee',
    retry: {
        count: 8,
        delay: 2,
        accumulate: 'multiply'
    },
    customPlaceholder: null,
    noPlaceholder: false,
    noLazyLoad: false,
    onLoad: () => {},
    onError: () => {}
}

export default GracefulImage
