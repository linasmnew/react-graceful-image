React Graceful Image
=============================

An image component for gracefully dealing with image errors, by providing a placeholder and retries on failure. Particularly useful in situations where your application might be used in poor signal areas such as when travelling on a train, bus or in a car.

## Installation

```sh
npm install --save react-graceful-image
```

### Basic Usage

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return <Image src="path_to_image" width="300" height="300" alt="My awesome image" />
  }
}
```

### Default Behaviour

While the image loads
1. Render an SVG placeholder - if environment doesn't support SVG, then avoid rendering the placeholder
2. If image loads successfully then display the image
3. If image fails to load - retry loading the image starting with a 2 second delay and doubling it with every retry *(by default retry stops after 8 tries)*

### Prop Options

| Prop | Description | Default | Type |
|---|---|---|---|
|**`src`**|Image url / path |*None*|*string*|
|**`width`**|Image width |*None*|*string*|
|**`height`**|Image height |*None*|*string*|
|**`className`**|Image class name |*None*|*string*|
|**`alt`**|Image description |*"Broken image placeholder"*|*string*|
|**`style`**|Image styles |*None*|*object*|
|**`placeholderColor`**|Placeholder's color|*"#eee"*|*string*|
|**`noPlaceholder `**|Turn off placeholder rendering|*false*|*bool*|
|**`retry`**|Retry algorithm's configuration, consisting of `count`, `delay` and `accumulate`|*`{count: 8, delay: 2, accumulate: 'multiply'`, ...*|*object*|
|**`noRetry`**|Turn off re-trying|*false*|*bool*|

### Placeholder

Setting an image's width and height via a `style` prop, or via explicit `width` and `height` props will also apply that width and height to the placeholder.

**Note** - Due to the way the placeholder is implemented, if you change the image's default display property via a className in a CSS file, you will also need to reflect it in the placeholder via the `styles` prop. (This is only necessary for the display property.)

### Retry

You can modify the default retry algorithm by supplying a `retry` prop consisting of 3 properties: `count`, `delay` and `accumulate`:

- `count` specifies the number of times you want to retry
- `delay` specifies the delay between retries (in seconds)
- `accumulate` specifies how the delay should increase with each retry, **_possible values:_** `"multiply"` (default), `"add"` or `false` (false can also be represented by simply omitting this property)

#### Accumulate

- `accumulate: "multiply"` will multiply delay after each retry by the given `delay` value, i.e. if `delay: 2` is given then 1st retry will be in 2 seconds, 2nd retry will be in 4 seconds, 3rd retry will be in 8 seconds, 4th retry will be in 16 seconds etc.
- `accumulate: "add"` will increment delay after each retry by the given `delay` value, i.e. if `delay: 2` is given then 1st retry will be in 2 seconds, 2nd retry will be in 4 seconds, 3rd retry will be in 6 seconds, 4th retry will be in 8 seconds, etc.
- `accumulate: "false"` will keep the delay constant between retries, i.e. if `delay: 2` is given then retry will run every 2 seconds

### Examples

**1**: Below code snippet will load the given image, while the image loads it will display a light grey (default) SVG placeholder. If loading the image fails, then it will retry loading the image again for a maximum of 10 times, with 2 second delay between each try (default retry configuration).

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return (
        <Image
            src="path_to_image"
            width="250"
            height="250"
            retry={{count: 10, delay: 2}}
            alt="My awesome image"
       />
    );
  }
}
```

**2**: Below code snippet will load the given image, while the image loads it will display a blue SVG placeholder. If loading the image fails, then it will retry loading the image again for a maximum of 8 times, with 2 second delay between each try (default retry configuration).

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return (
        <Image
            src="path_to_image"
            className="content-image"
            placeholderColor="#0083FE"
            alt="My awesome image"
       />
    );
  }
}
```

**3**: Below code snippet will load the given image, while the image loads it will display a light grey (default) SVG placeholder. If loading the image fails, then it will retry loading the image again for a maximum of 15 times, with initial delay of 3 seconds which will then increase to 6 seconds, then to 9 seconds, then to 12 seconds, and so on.

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return (
        <Image
            src="path_to_image"
            width="150"
            height="150"
            retry={{count: 15, delay: 3, accumulate: 'add'}}
            alt="My awesome image"
       />
    );
  }
}
```
