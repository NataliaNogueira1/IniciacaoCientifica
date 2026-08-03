using ColmeiaApi.Data;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Tests.Helpers;

public static class DbHelper
{
    public static ColmeiaContext CreateInMemory(string dbName = "TestDb")
    {
        var options = new DbContextOptionsBuilder<ColmeiaContext>()
            .UseInMemoryDatabase(databaseName: dbName + Guid.NewGuid())
            .Options;
        return new ColmeiaContext(options);
    }
}
