# ==========================================
# Stage 1: Composer dependencies
# ==========================================
FROM composer:2.7 AS composer

WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --optimize-autoloader

COPY backend/ ./
RUN composer dump-autoload --optimize --no-dev

# ==========================================
# Stage 2: PHP-FPM production image
# ==========================================
FROM php:8.3-fpm-alpine AS production

# セキュリティアップデート
RUN apk update && apk upgrade --no-cache

# PHP拡張
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        gd \
        zip \
        intl \
        opcache \
        bcmath \
        pcntl \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear

# PHP設定
COPY docker/php/php-production.ini /usr/local/etc/php/conf.d/production.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html

# アプリケーション
COPY --from=composer /app /var/www/html

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

USER www-data

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD php-fpm -t || exit 1

CMD ["php-fpm"]
