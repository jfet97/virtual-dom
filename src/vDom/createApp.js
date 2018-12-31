import render from './render';
import mount from './mount';

export default _app => {
    const mountingPoint = document.getElementById('app');
    const root = mount(render(_app), mountingPoint);
    return { _app, root };
}