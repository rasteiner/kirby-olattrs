<?php

use Kirby\Cms\App;
use Kirby\Sane\Html;

Html::$allowedTags['ol'] = ['type', 'start', 'reversed'];

App::plugin('rasteiner/olAttrs', []);