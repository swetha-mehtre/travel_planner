// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some(coord => !Number.isFinite(coord))) {
    return null; // Invalid coordinates
  }
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Rate limiting helper
const rateLimiter = {
  lastCall: 0,
  minInterval: 1000, // 1 second between calls
  async wait() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastCall));
    }
    this.lastCall = Date.now();
  }
};

const factChecker = {
  cache: new Map(),

  async validateLocation(location, centerPoint) {
    try {
      await rateLimiter.wait();
      const cacheKey = `location:${location.name}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location.name)}&format=json&limit=1&addressdetails=1&extratags=1`
      );
      const data = await response.json();

      if (data.length === 0) {
        return { exists: false, verified: false };
      }

      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      const distance = calculateDistance(centerPoint.lat, centerPoint.lng, coords.lat, coords.lng);
      if (distance === null) {
        return { exists: true, verified: false, coordinates: coords };
      }

      const details = await this.getLocationDetails(location.name, coords);
      const result = {
        exists: true,
        tooFar: distance > 50,
        distance,
        coordinates: coords,
        ...details,
        verified: true,
        timestamp: Date.now()
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      return { verified: false };
    }
  },

  async validatePrice(activity) {
    try {
      await rateLimiter.wait();
      const cacheKey = `price:${activity.name}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const osmData = await this.getOSMPriceInfo(activity);
      const priceEstimates = {
        provided: activity.cost,
        osm: osmData.price
      };

      const result = {
        verified: true,
        suggestedPrice: this.calculateAveragePrice(priceEstimates),
        priceConfidence: this.calculatePriceConfidence(priceEstimates),
        timestamp: Date.now()
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      return { verified: false };
    }
  },

  async getLocationDetails(name, coords) {
    try {
      await rateLimiter.wait();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&extratags=1`
      );
      const data = await response.json();
      const description = await this.getWikiDescription(name);

      return {
        type: data.type,
        category: data.category,
        opening_hours: data.extratags?.opening_hours,
        website: data.extratags?.website,
        phone: data.extratags?.phone,
        wheelchair: data.extratags?.wheelchair,
        description
      };
    } catch (error) {
      return { description: null };
    }
  },

  async getWikiDescription(name) {
    try {
      await rateLimiter.wait();
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(name)}&origin=*`
      );
      const data = await response.json();
      const pageId = Object.keys(data.query.pages)[0];
      return data.query.pages[pageId].extract || null;
    } catch (error) {
      return null;
    }
  },

  async getOSMPriceInfo(activity) {
    try {
      await rateLimiter.wait();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(activity.name)}&format=json&extratags=1`
      );
      const data = await response.json();
      return { price: data[0]?.extratags?.fee || null };
    } catch (error) {
      return { price: null };
    }
  },

  calculateAveragePrice(estimates) {
    const prices = Object.values(estimates).filter(price => Number.isFinite(price));
    return prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : estimates.provided || 0;
  },

  calculatePriceConfidence(estimates) {
    const prices = Object.values(estimates).filter(price => Number.isFinite(price));
    if (prices.length < 2) return 'low';

    const avg = this.calculateAveragePrice(estimates);
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
    const variationCoefficient = (Math.sqrt(variance) / avg) * 100;

    if (variationCoefficient < 15) return 'high';
    if (variationCoefficient < 30) return 'medium';
    return 'low';
  },

  clearCache() {
    this.cache.clear();
  }
};

export default factChecker;