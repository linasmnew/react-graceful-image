import React from 'react'
import ReactDOM from 'react-dom'
import Enzyme, { mount, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import GracefulImage from '../src'

Enzyme.configure({ adapter: new Adapter() })

describe('react-graceful-image client', () => {
    it('should render without errors', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150'
        }
        const div = document.createElement('div')
        ReactDOM.render(<GracefulImage { ...props } />, div)
    })

    it('should render placeholder when image has not loaded', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150'
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)

        expect(mountWrapper.find('img').length).toBe(1)
        expect(mountWrapper.find('img').prop('src')).toEqual('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
        expect(mountWrapper.find('img').prop('width')).toEqual(props.width)
        expect(mountWrapper.find('img').prop('height')).toEqual(props.height)
    })

    it('should render custom placeholder when image has not loaded', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150',
            className: 'custom-placeholder'
        }
        const mountWrapper = mount(<GracefulImage customPlaceholder={ ref => <img ref={ ref } { ...props } /> } />)

        expect(mountWrapper.find('img').length).toBe(1)
        expect(mountWrapper.find('img').prop('src')).toEqual('fake.png')
        expect(mountWrapper.find('img').prop('width')).toEqual(props.width)
        expect(mountWrapper.find('img').prop('height')).toEqual(props.height)
        expect(mountWrapper.find('img').prop('className')).toEqual('custom-placeholder')
    })

    it('should render image when image has loaded', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150'
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)
        mountWrapper.setState({ loaded: true })

        expect(mountWrapper.find('img').length).toBe(1)
        expect(mountWrapper.find('img').prop('src')).toEqual(props.src)
        expect(mountWrapper.find('img').prop('width')).toEqual(props.width)
        expect(mountWrapper.find('img').prop('height')).toEqual(props.height)
    })

    it('should not render anything when given noPlaceholder prop until image has loaded', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150',
            noPlaceholder: true
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)
        expect(mountWrapper.find('img').length).toBe(0)

        mountWrapper.setState({ loaded: true })
        expect(mountWrapper.find('img').length).toBe(1)
    })

    it('should change placeholder\'s color', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150',
            placeholderColor: '#aaa'
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)

        expect(mountWrapper.find('img').prop('style')).toHaveProperty(
            'background',
            props.placeholderColor
        )
    })

    it('should change placeholder\'s and loaded image\'s alt value', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150',
            alt: 'hello world'
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)
        expect(mountWrapper.find('img').prop('alt')).toEqual(props.alt)

        mountWrapper.setState({ loaded: true })
        expect(mountWrapper.find('img').prop('alt')).toEqual(props.alt)
    })

    it('should apply className to placeholder image and loaded image', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150',
            className: 'graceful_image'
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)
        expect(mountWrapper.find('img').prop('className')).toEqual(
            props.className
        )

        mountWrapper.setState({ loaded: true })
        expect(mountWrapper.find('img').prop('className')).toEqual(
            props.className
        )
    })

    it('should register load, scroll, resize and gestureend event listeners', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150'
        }
        const spy = jest.spyOn(window, 'addEventListener')
        shallow(<GracefulImage { ...props } />)

        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(4)
        expect(spy.mock.calls[0][0]).toEqual('load')
        expect(spy.mock.calls[1][0]).toEqual('scroll')
        expect(spy.mock.calls[2][0]).toEqual('resize')
        expect(spy.mock.calls[3][0]).toEqual('gestureend')
        spy.mockClear()
    })

    it('should not register any event listeners when given noLazyLoad prop', () => {
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150',
            noLazyLoad: true
        }
        const spy = jest.spyOn(window, 'addEventListener')
        shallow(<GracefulImage { ...props } />)

        expect(spy).toHaveBeenCalledTimes(0)
        spy.mockClear()
    })

    it('should fire onLoad prop when image loads', done => {
        global.Image = class {
            constructor () {
                setTimeout(() => {
                    this.onload()
                }, 0)
            }
        }
        const onLoad = () => done()
        const props = {
            src: 'fake.png',
            width: '150',
            height: '150',
            noLazyLoad: true,
            onLoad
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)
        mountWrapper.setState({ loaded: true })
    })

    it('should fire onError prop when image fails to load after reaching the retry limit', done => {
        global.Image = class {
            constructor () {
                setTimeout(() => {
                    this.onerror()
                }, 0)
            }
        }
        const onError = () => done()
        const props = {
            src: '',
            width: '150',
            height: '150',
            retry: { count: 0, delay: 1 },
            onError
        }
        const mountWrapper = mount(<GracefulImage { ...props } />)
        mountWrapper.setState({ loaded: false })
    })
})
