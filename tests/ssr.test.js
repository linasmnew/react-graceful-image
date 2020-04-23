/**
 * @jest-environment node
 */
import React from 'react'
import Enzyme, { render } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import GracefulImage from '../src'

Enzyme.configure({ adapter: new Adapter() })

describe('react-graceful-image SSR', () => {
    it('should ssr render without errors', () => {
        const props = {
            src: 'https://linasmickevicius.com/images/browser.png',
            width: '150',
            height: '150'
        }
        render(<GracefulImage {...props} />)
    })
})
